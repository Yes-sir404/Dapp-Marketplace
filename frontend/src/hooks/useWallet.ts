import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";

interface UseWalletReturn {
  account: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  isConnecting: boolean;
  error: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isMetaMaskInstalled: boolean;
}

export const useWallet = (): UseWalletReturn => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isMetaMaskInstalled =
    typeof window !== "undefined" && Boolean(window.ethereum);

  const connectWallet = useCallback(async () => {
    if (!isMetaMaskInstalled || !window.ethereum) {
      setError(
        "MetaMask is not installed. Please install it to use this dApp."
      );
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length > 0) {
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        const signerInstance = await browserProvider.getSigner();

        setAccount(accounts[0]);
        setProvider(browserProvider);
        setSigner(signerInstance);

        localStorage.setItem("walletConnected", "true");
      }
    } catch (err: any) {
      console.error("Error connecting wallet:", err);
      if (err.code === 4001) {
        setError("Please connect to MetaMask.");
      } else {
        setError("An error occurred while connecting the wallet.");
      }
    } finally {
      setIsConnecting(false);
    }
  }, [isMetaMaskInstalled]);

  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setError(null);
    localStorage.removeItem("walletConnected");
  }, []);

  useEffect(() => {
    const checkWalletConnection = async () => {
      if (
        isMetaMaskInstalled &&
        window.ethereum &&
        localStorage.getItem("walletConnected") === "true"
      ) {
        try {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });

          if (accounts.length > 0) {
            const browserProvider = new ethers.BrowserProvider(window.ethereum);
            const signerInstance = await browserProvider.getSigner();

            setAccount(accounts[0]);
            setProvider(browserProvider);
            setSigner(signerInstance);
          }
        } catch (err) {
          console.error("Error checking wallet connection:", err);
          localStorage.removeItem("walletConnected");
        }
      }
    };

    checkWalletConnection();
  }, [isMetaMaskInstalled]);

  useEffect(() => {
    if (!isMetaMaskInstalled || !window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else if (accounts[0] !== account) {
        setAccount(accounts[0]);
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum?.removeListener("chainChanged", handleChainChanged);
    };
  }, [account, disconnectWallet, isMetaMaskInstalled]);

  return {
    account,
    provider,
    signer,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
    isMetaMaskInstalled,
  };
};
