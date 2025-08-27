# GymPass NFT - Mobile App Demo

A blockchain-based gym membership platform where memberships are represented as NFTs with escrow protection and transferability.

## Features

### 🏋️ NFT Gym Memberships
- Mint gym memberships as NFTs
- Transferable and tradeable on secondary marketplace
- Escrow protection for refunds
- Insurance coverage available

### 💰 Wallet & Payments
- KRW wallet with deposit functionality
- Support for both Web2 (credit card, bank transfer) and crypto payments
- Real-time balance tracking

### 🛒 Marketplace
- Buy and sell NFT memberships
- Price comparison with official rates
- Instant purchase or negotiable offers
- Hot deals and premium listings

### 📱 Complete Workflow Demo

## How to Test the NFT Workflow

### 1. **Login**
- Click "Login with LINE" to access the app
- You'll start with ₩125,000 KRW and one sample NFT

### 2. **Mint New NFT**
- Go to "Find Gym" → Select a gym → "View Details"
- Choose a membership option and click "Mint NFT"
- Your balance will be deducted and NFT added to your collection

### 3. **Deposit Funds**
- Click the "Deposit" button in your wallet
- Choose Web2 or Crypto payment method
- Enter amount and confirm deposit

### 4. **Buy from Marketplace**
- Go to "Marketplace" tab
- Browse available NFT memberships
- Click "Buy Now" on any NFT
- Complete purchase process

### 5. **Sell Your NFT**
- On home page, click "Sell" button on your NFT
- Set your price (market rate, premium, or custom)
- Choose listing options (instant sale, negotiable)
- Confirm listing

### 6. **Transfer NFT**
- Click "Transfer" button on your NFT
- Enter recipient wallet address
- Confirm transfer

### 7. **View Your Collection**
- Use "My NFTs" button to see owned NFTs
- Use "History" button to view all transactions
- Use "Simulate Sale" to test selling workflow

### 8. **Reset Demo**
- Click "Reset Demo" to restore initial state

## Technical Features

### Storage System
- Uses localStorage for persistent demo data
- Tracks balance, owned NFTs, listings, and transaction history
- Real-time UI updates

### Transaction Types
- **Mint**: Create new NFT membership
- **Buy**: Purchase from marketplace
- **Sell**: List NFT for sale
- **Transfer**: Send to another wallet
- **Deposit**: Add funds to wallet

### NFT Properties
- Unique ID and metadata
- Remaining term and expiry date
- Escrowed funds for refund protection
- Transferable and refundable status
- Insurance coverage

## Getting Started

1. Start a local server:
   ```bash
   python3 -m http.server 8080
   ```

2. Open http://localhost:8080 in your browser

3. Click "Login with LINE" to begin

4. Explore the complete NFT workflow!

## Demo Data

The app initializes with:
- ₩125,000 KRW balance
- 1 sample NFT (FitZone Downtown Premium Pass)
- Empty transaction history

All data persists in localStorage until reset.