// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title Digital Marketplace
 * @dev A secure marketplace for buying/selling digital products that can be sold multiple times.
 * @notice Examples: software, ebooks, music, videos, templates, courses, etc.
 * @notice Features: instant delivery (via frontend), marketplace fees, security protections, owner controls.
 */
contract Marketplace is ReentrancyGuard, Ownable, Pausable {
    // ===== DIGITAL PRODUCT STRUCTURE =====

    /**
     * @dev Structure to store digital product information
     * @param uri IPFS URI for product content
     * @param thumbnailUri IPFS URI for product thumbnail/preview image
     * @param id Unique product ID
     * @param name Product title (e.g., "Photoshop Template")
     * @param description Detailed product description and features
     * @param category Product category (e.g., Digital Art, Music, Software)
     * @param price Product price in wei (1 ETH = 10^18 wei)
     * @param seller Address of the creator/seller
     * @param salesCount Number of times the product has been sold
     */
    struct Product {
        string uri; // IPFS URI for product content
        string thumbnailUri; // IPFS URI for product thumbnail/preview image
        uint256 id;
        string name;
        string description;
        string category; // e.g., Digital Art, Music, Software
        uint256 price;
        address payable seller;
        uint256 salesCount;
    }

    // ===== STORAGE & STATE =====

    mapping(uint256 => Product) public products; // productId => Product
    uint256 public productCount; // total products created

    // ===== INDEXES =====
    mapping(address => uint256[]) public sellerProducts; // seller => productIds
    mapping(bytes32 => uint256[]) public categoryProducts; // keccak256(category) => productIds

    // Track which users have purchased which products
    mapping(uint256 => mapping(address => bool)) public hasPurchased; // productId => buyer => hasPurchased

    uint256 public marketplaceFeePercent = 250; // 2.5% (parts per 10_000)
    uint256 public collectedFees; // accumulated fees (wei)

    uint256 public constant MAX_FEE_PERCENT = 1000; // 10%
    uint256 public constant MAX_PRICE = 1000 ether;

    // ===== EVENTS =====

    event ProductCreated(
        string uri,
        string thumbnailUri,
        uint256 indexed id,
        string name,
        string description,
        string category,
        uint256 price,
        address indexed seller
    );

    event ProductUpdated(
        uint256 indexed id,
        string name,
        string description,
        string category,
        uint256 price,
        address indexed seller
    );

    event ProductMediaUpdated(
        uint256 indexed id,
        string uri,
        string thumbnailUri,
        address indexed seller
    );

    event ProductPurchased(
        uint256 indexed id,
        address indexed seller,
        address indexed buyer,
        uint256 price,
        uint256 fee
    );

    event MarketplaceFeeUpdated(uint256 newFeePercent);
    event FeesWithdrawn(address owner, uint256 amount);
    event MarketplacePaused();
    event MarketplaceUnpaused();

    // ===== CONSTRUCTOR =====

    constructor() Ownable(msg.sender) {}

    // ===== CORE FUNCTIONS =====

    /**
     * @dev List a new digital product for sale (unlimited sales).
     */
    function createProduct(
        string memory _name,
        string memory _description,
        string memory _category,
        uint256 _price,
        string memory _uri,
        string memory _thumbnailUri
    ) public whenNotPaused {
        require(bytes(_name).length > 0, "Product name cannot be empty");
        require(bytes(_name).length <= 100, "Product name too long");
        require(bytes(_description).length <= 500, "Description too long");
        require(bytes(_category).length > 0, "Category required");
        require(bytes(_category).length <= 50, "Category too long");
        require(_price > 0, "Product price must be greater than 0");
        require(_price <= MAX_PRICE, "Product price too high");
        require(bytes(_uri).length > 0, "Product URI required");
        require(bytes(_thumbnailUri).length > 0, "Thumbnail URI required");

        productCount++;
        products[productCount] = Product({
            uri: _uri,
            thumbnailUri: _thumbnailUri,
            id: productCount,
            name: _name,
            description: _description,
            category: _category,
            price: _price,
            seller: payable(msg.sender),
            salesCount: 0
        });

        // Index by seller & category
        sellerProducts[msg.sender].push(productCount);
        categoryProducts[keccak256(bytes(_category))].push(productCount);

        emit ProductCreated(
            _uri,
            _thumbnailUri,
            productCount,
            _name,
            _description,
            _category,
            _price,
            msg.sender
        );
    }

    /**
     * @dev Update an existing product (only by the seller).
     */
    function updateProduct(
        uint256 _productId,
        string memory _name,
        string memory _description,
        string memory _category,
        uint256 _price
    ) public whenNotPaused {
        require(
            _productId > 0 && _productId <= productCount,
            "Invalid product ID"
        );
        require(bytes(_name).length > 0, "Product name cannot be empty");
        require(bytes(_name).length <= 100, "Product name too long");
        require(bytes(_description).length <= 500, "Description too long");
        require(bytes(_category).length > 0, "Category required");
        require(bytes(_category).length <= 50, "Category too long");
        require(_price > 0, "Product price must be greater than 0");
        require(_price <= MAX_PRICE, "Product price too high");

        Product storage product = products[_productId];
        require(product.seller == msg.sender, "Only seller can update product");

        // If category changed, update index
        if (keccak256(bytes(product.category)) != keccak256(bytes(_category))) {
            // Remove from old category array
            bytes32 oldKey = keccak256(bytes(product.category));
            uint256[] storage arr = categoryProducts[oldKey];
            for (uint256 i = 0; i < arr.length; i++) {
                if (arr[i] == _productId) {
                    arr[i] = arr[arr.length - 1];
                    arr.pop();
                    break;
                }
            }
            // Add to new category array
            categoryProducts[keccak256(bytes(_category))].push(_productId);
        }

        product.name = _name;
        product.description = _description;
        product.category = _category;
        product.price = _price;

        emit ProductUpdated(
            _productId,
            _name,
            _description,
            _category,
            _price,
            msg.sender
        );
    }

    /**
     * @dev Update product media (URI and thumbnail) - only by the seller.
     */
    function updateProductMedia(
        uint256 _productId,
        string memory _uri,
        string memory _thumbnailUri
    ) public whenNotPaused {
        require(
            _productId > 0 && _productId <= productCount,
            "Invalid product ID"
        );
        require(bytes(_uri).length > 0, "Product URI required");
        require(bytes(_thumbnailUri).length > 0, "Thumbnail URI required");

        Product storage product = products[_productId];
        require(
            product.seller == msg.sender,
            "Only seller can update product media"
        );

        product.uri = _uri;
        product.thumbnailUri = _thumbnailUri;

        emit ProductMediaUpdated(_productId, _uri, _thumbnailUri, msg.sender);
    }

    /**
     * @dev Purchase a product. Each user can only buy once.
     */
    function purchaseProduct(
        uint256 _productId
    ) public payable nonReentrant whenNotPaused {
        require(
            _productId > 0 && _productId <= productCount,
            "Invalid product ID"
        );

        Product storage product = products[_productId];

        require(msg.value >= product.price, "Insufficient payment");
        require(product.seller != msg.sender, "Cannot buy your own product");
        require(
            !hasPurchased[_productId][msg.sender],
            "Already purchased this product"
        );

        // Fee calculation
        uint256 fee = (product.price * marketplaceFeePercent) / 10000;
        uint256 sellerAmount = product.price - fee;

        // Effects
        collectedFees += fee;
        product.salesCount += 1;
        hasPurchased[_productId][msg.sender] = true; // Mark as purchased

        // Interactions
        (bool sent, ) = product.seller.call{value: sellerAmount}("");
        require(sent, "Failed to send payment to seller");

        // Refund any excess
        // if (msg.value > product.price) {
        //     uint256 refund = msg.value - product.price;
        //     (bool refunded, ) = payable(msg.sender).call{value: refund}("");
        //     require(refunded, "Refund failed");
        // }

        emit ProductPurchased(
            _productId,
            product.seller,
            msg.sender,
            product.price,
            fee
        );
    }

    // ===== VIEW HELPERS =====

    /**
     * @dev Returns all products.
     */
    // function getAllProducts() public view returns (Product[] memory) {
    //     Product[] memory allProducts = new Product[](productCount);
    //     for (uint256 i = 1; i <= productCount; i++) {
    //         allProducts[i - 1] = products[i];
    //     }
    //     return allProducts;
    // }

    /**
     * @dev Alias of getAllProducts; kept for frontend semantics.
     */
    function getAvailableProducts() public view returns (Product[] memory) {
        Product[] memory availableProducts = new Product[](productCount);
        for (uint256 i = 1; i <= productCount; i++) {
            availableProducts[i - 1] = products[i];
        }
        return availableProducts;
    }

    /**
     * @dev Get a specific product.
     */
    function getProduct(
        uint256 _productId
    ) public view returns (Product memory) {
        require(
            _productId > 0 && _productId <= productCount,
            "Invalid product ID"
        );
        return products[_productId];
    }

    /**
     * @dev Check if a user has purchased a specific product.
     */
    function hasUserPurchased(
        uint256 _productId,
        address _user
    ) public view returns (bool) {
        require(
            _productId > 0 && _productId <= productCount,
            "Invalid product ID"
        );
        return hasPurchased[_productId][_user];
    }

    /**
     * @dev Get all products created by a specific seller (indexed).
     */
    function getSellerProducts(
        address _seller
    ) public view returns (Product[] memory) {
        uint256[] storage ids = sellerProducts[_seller];
        Product[] memory out = new Product[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            out[i] = products[ids[i]];
        }
        return out;
    }

    /**
     * @dev Get all products in a specific category (indexed).
     */
    function getProductsByCategory(
        string memory _category
    ) public view returns (Product[] memory) {
        uint256[] storage ids = categoryProducts[keccak256(bytes(_category))];
        Product[] memory out = new Product[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            out[i] = products[ids[i]];
        }
        return out;
    }

    /**
     * @dev Overall marketplace stats.
     */
    function getMarketplaceStats()
        external
        view
        returns (
            uint256 totalProducts,
            uint256 totalSales,
            uint256 totalFeesCollected,
            uint256 currentFeePercent
        )
    {
        uint256 totalSalesCount;
        for (uint256 i = 1; i <= productCount; i++) {
            totalSalesCount += products[i].salesCount;
        }

        return (
            productCount,
            totalSalesCount,
            collectedFees,
            marketplaceFeePercent
        );
    }

    // ===== OWNER FUNCTIONS =====

    function setMarketplaceFee(uint256 _feePercent) external onlyOwner {
        require(_feePercent <= MAX_FEE_PERCENT, "Fee too high");
        marketplaceFeePercent = _feePercent;
        emit MarketplaceFeeUpdated(_feePercent);
    }

    function withdrawFees() external onlyOwner nonReentrant {
        uint256 amount = collectedFees;
        require(amount > 0, "No fees to withdraw");
        collectedFees = 0; // effects before interaction

        (bool sent, ) = payable(owner()).call{value: amount}("");
        require(sent, "Failed to withdraw fees");

        emit FeesWithdrawn(owner(), amount);
    }

    // ===== PAUSING FUNCTIONS =====
    function pauseMarketplace() external onlyOwner {
        _pause();
        emit MarketplacePaused();
    }

    function unpauseMarketplace() external onlyOwner {
        _unpause();
        emit MarketplaceUnpaused();
    }

    function emergencyPause() external onlyOwner {
        _pause();
        emit MarketplacePaused();
    }
}
