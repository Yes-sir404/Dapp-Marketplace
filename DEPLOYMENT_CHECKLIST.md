# Deployment Checklist

## ✅ Build Status

- [x] Frontend builds successfully without errors
- [x] Chunk sizes optimized (largest chunk: 317KB)
- [x] No sensitive data exposed in build artifacts

## 🔒 Security Checklist

- [x] No hardcoded API keys or secrets in code
- [x] Environment variables properly configured
- [x] .gitignore excludes sensitive files (.env, .env.\*)
- [x] Contract addresses are public (no sensitive data)

## 📁 Files to Deploy

- `frontend/dist/` - Built frontend application
- `contracts/` - Smart contract source code
- `artifacts/` - Compiled contract artifacts
- `typechain-types/` - TypeScript type definitions

## 🚫 Files NOT to Deploy

- `node_modules/` - Dependencies (install via package.json)
- `.env` files - Environment variables (configure on server)
- `cache/` - Build cache
- `coverage/` - Test coverage reports

## 🌐 Environment Variables Required

### Frontend (.env)

```bash
VITE_PINATA_JWT=your_pinata_jwt_token_here
```

### Backend/Hardhat (.env)

```bash
# Optional: Custom RPC URLs
SEPOLIA_RPC_URL=your_custom_sepolia_rpc_url
BLOCKDAG_RPC_URL=your_custom_blockdag_rpc_url

# Optional: API Keys for verification
INFURA_API_KEY=your_infura_api_key
ETHERSCAN_API_KEY=your_etherscan_api_key
POLYGONSCAN_API_KEY=your_polygonscan_api_key

# Optional: Private key for deployment (use with caution)
PRIVATE_KEY=your_private_key_for_deployment
```

## 🚀 Deployment Steps

1. **Build the frontend:**

   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy smart contracts (if needed):**

   ```bash
   npm run compile
   npm run deploy
   ```

3. **Upload frontend files:**

   - Upload contents of `frontend/dist/` to your web server
   - Ensure all static assets are accessible

4. **Configure environment variables:**
   - Set `VITE_PINATA_JWT` on your hosting platform
   - Update contract addresses if deploying new contracts

## 📋 Post-Deployment Verification

- [ ] Frontend loads without console errors
- [ ] Wallet connection works
- [ ] File upload to IPFS works (requires VITE_PINATA_JWT)
- [ ] Smart contract interactions work
- [ ] All routes are accessible

## 🔧 Troubleshooting

### Common Issues:

1. **CORS errors**: Ensure your hosting platform allows the necessary origins
2. **Environment variables not loading**: Check variable naming (must start with VITE\_)
3. **Contract not found**: Verify contract address and network
4. **IPFS upload fails**: Check VITE_PINATA_JWT is set correctly

### Build Commands:

```bash
# Frontend build
cd frontend && npm run build

# Full project build
npm run compile
```
