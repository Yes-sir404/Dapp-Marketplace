// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
// NOTE: Pausable is in the security folder
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
     * @param id Unique product ID
     * @param name Product title (e.g., "Photoshop Template")
     * @param description Detailed product description and features
     * @param price Product price in wei (1 ETH = 10^18 wei)
     * @param seller Address of the creator/seller
     * @param salesCount Number of times the product has been sold
     */
    struct Product {
        uint256 id;
        string name;
        string description;
        uint256 price;
        address payable seller;
        uint256 salesCount;
    }

    // ===== STORAGE & STATE =====

    mapping(uint256 => Product) public products; // productId => Product
    uint256 public productCount; // total products created

    // Track which users have purchased which products
    mapping(uint256 => mapping(address => bool)) public hasPurchased; // productId => buyer => hasPurchased

    uint256 public marketplaceFeePercent = 250; // 2.5% (parts per 10_000)
    uint256 public collectedFees; // accumulated fees (wei)

    uint256 public constant MAX_FEE_PERCENT = 1000; // 10%
    uint256 public constant MAX_PRICE = 1000 ether;

    // ===== EVENTS =====

    event ProductCreated(
        uint256 id,
        string name,
        string description,
        uint256 price,
        address seller
    );

    event ProductUpdated(
        uint256 id,
        string name,
        string description,
        uint256 price,
        address seller
    );

    event ProductPurchased(uint256 id, address seller, address buyer);

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
        uint256 _price
    ) public whenNotPaused {
        require(bytes(_name).length > 0, "Product name cannot be empty");
        require(bytes(_name).length <= 100, "Product name too long");
        require(bytes(_description).length <= 500, "Description too long");
        require(_price > 0, "Product price must be greater than 0");
        require(_price <= MAX_PRICE, "Product price too high");

        productCount++;
        products[productCount] = Product({
            id: productCount,
            name: _name,
            description: _description,
            price: _price,
            seller: payable(msg.sender),
            salesCount: 0
        });

        emit ProductCreated(
            productCount,
            _name,
            _description,
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
        uint256 _price
    ) public whenNotPaused {
        require(
            _productId > 0 && _productId <= productCount,
            "Invalid product ID"
        );
        require(bytes(_name).length > 0, "Product name cannot be empty");
        require(bytes(_name).length <= 100, "Product name too long");
        require(bytes(_description).length <= 500, "Description too long");
        require(_price > 0, "Product price must be greater than 0");
        require(_price <= MAX_PRICE, "Product price too high");

        Product storage product = products[_productId];
        require(product.seller == msg.sender, "Only seller can update product");

        product.name = _name;
        product.description = _description;
        product.price = _price;

        emit ProductUpdated(
            _productId,
            _name,
            _description,
            _price,
            msg.sender
        );
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
        if (msg.value > product.price) {
            uint256 refund = msg.value - product.price;
            (bool refunded, ) = payable(msg.sender).call{value: refund}("");
            require(refunded, "Refund failed");
        }

        emit ProductPurchased(_productId, product.seller, msg.sender);
    }

    // ===== VIEW HELPERS =====

    /**
     * @dev Returns all products.
     */
    function getAllProducts() public view returns (Product[] memory) {
        Product[] memory allProducts = new Product[](productCount);
        for (uint256 i = 1; i <= productCount; i++) {
            allProducts[i - 1] = products[i];
        }
        return allProducts;
    }

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
     * @dev Get all products created by a specific seller.
     */
    function getSellerProducts(
        address _seller
    ) public view returns (Product[] memory) {
        uint256 sellerCount;
        for (uint256 i = 1; i <= productCount; i++) {
            if (products[i].seller == _seller) sellerCount++;
        }

        Product[] memory sellerProducts = new Product[](sellerCount);
        uint256 idx;
        for (uint256 i = 1; i <= productCount; i++) {
            if (products[i].seller == _seller) {
                sellerProducts[idx] = products[i];
                idx++;
            }
        }
        return sellerProducts;
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

    // ===== OPTIONAL PAUSING (uncomment if needed) =====
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
