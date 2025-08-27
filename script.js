// App State
let currentUser = null;
let currentPage = 'home';
let userStorage = {
    balance: 125000,
    ownedNFTs: [],
    transactionHistory: [],
    listedNFTs: []
};

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - GymPass App Initializing...');
    const savedUser = localStorage.getItem('gympass_user');
    const savedStorage = localStorage.getItem('gympass_storage');
    
    if (savedStorage) {
        userStorage = JSON.parse(savedStorage);
    } else {
        // Initialize with sample NFT for demo
        userStorage.ownedNFTs = [{
            id: 'GYM001234',
            name: 'FitZone Downtown - Premium Pass',
            gym: 'FitZone Downtown',
            location: 'Downtown',
            duration: '12 months',
            remaining: '8 months',
            expires: 'Dec 31, 2024',
            escrowed: 960000,
            originalPrice: 1440000,
            progress: 67,
            purchaseDate: '2024-04-01',
            transferable: true,
            refundable: true,
            insured: true
        }];
        saveUserStorage();
    }
    
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showMainApp();
        updateUI();
    } else {
        showLoginScreen();
    }
});

// Storage Management
function saveUserStorage() {
    localStorage.setItem('gympass_storage', JSON.stringify(userStorage));
}

function updateUI() {
    // Update balance display
    const balanceElement = document.querySelector('.balance');
    if (balanceElement) {
        balanceElement.textContent = `₩${userStorage.balance.toLocaleString()} KRW`;
    }
    
    // Update wallet balance in modals
    const walletBalanceElements = document.querySelectorAll('.balance-amount');
    walletBalanceElements.forEach(el => {
        el.textContent = `₩${userStorage.balance.toLocaleString()}`;
    });
    
    // Update current balance in deposit modal
    const currentBalanceElement = document.querySelector('.current-balance strong');
    if (currentBalanceElement) {
        currentBalanceElement.textContent = `₩${userStorage.balance.toLocaleString()}`;
    }
    
    // Update dynamic content
    updateMembershipCard();
    updateMarketplace();
}

function updateMembershipCard() {
    const membershipCard = document.querySelector('.membership-card');
    if (!membershipCard) return;
    
    if (userStorage.ownedNFTs.length === 0) {
        // Show no membership state
        membershipCard.innerHTML = `
            <div class="card-header">
                <h3>No Active Membership</h3>
                <span class="status inactive">Inactive</span>
            </div>
            <div class="no-membership">
                <p><i class="fas fa-info-circle"></i> You don't have any gym memberships yet.</p>
                <button class="primary-btn" onclick="showPage('find-gym')" style="margin-top: 15px;">
                    Find a Gym
                </button>
            </div>
        `;
        return;
    }
    
    if (userStorage.ownedNFTs.length === 1) {
        // Show single NFT in detail
        const nft = userStorage.ownedNFTs[0];
        const progressPercent = Math.round((parseFloat(nft.remaining.split(' ')[0]) / parseFloat(nft.duration.split(' ')[0])) * 100);
        
        membershipCard.innerHTML = `
            <div class="card-header">
                <h3>Current Membership</h3>
                <span class="status active">Active</span>
            </div>
            <div class="gym-info">
                <h4>${nft.gym}</h4>
                <p><i class="fas fa-map-marker-alt"></i> ${nft.location}</p>
                <p><i class="fas fa-calendar"></i> Expires: ${nft.expires}</p>
            </div>
            <div class="escrow-details">
                <div class="escrow-row">
                    <span class="escrow-label">Original Value:</span>
                    <span class="escrow-value">₩${nft.originalPrice.toLocaleString()}</span>
                </div>
                <div class="escrow-row">
                    <span class="escrow-label">Escrowed Funds:</span>
                    <span class="escrow-value highlight">₩${nft.escrowed.toLocaleString()}</span>
                </div>
                <div class="escrow-row">
                    <span class="escrow-label">Remaining Term:</span>
                    <span class="escrow-value">${nft.remaining}</span>
                </div>
                <div class="membership-progress">
                    <div class="progress-bar-home">
                        <div class="progress-fill-home" style="width: ${progressPercent}%"></div>
                    </div>
                    <span class="progress-text">${progressPercent}% remaining</span>
                </div>
            </div>
            <div class="nft-info">
                <p>NFT ID: ${nft.id}</p>
                <div class="nft-features">
                    ${nft.transferable ? '<span class="feature-tag">Transferable</span>' : ''}
                    ${nft.refundable ? '<span class="feature-tag">Refundable</span>' : ''}
                    ${nft.insured ? '<span class="feature-tag">Insured</span>' : ''}
                </div>
                <div class="nft-actions">
                    <button class="view-nft-btn" onclick="showNFTDetails('${nft.id}')">View NFT</button>
                    <button class="transfer-nft-btn" onclick="transferNFT('${nft.id}')">Transfer</button>
                    <button class="sell-nft-btn" onclick="sellNFT('${nft.id}')">Sell</button>
                </div>
            </div>
        `;
    } else {
        // Show multiple NFTs in a grid
        const totalEscrowed = userStorage.ownedNFTs.reduce((sum, nft) => sum + nft.escrowed, 0);
        
        let nftsHTML = '';
        userStorage.ownedNFTs.forEach(nft => {
            const progressPercent = Math.round((parseFloat(nft.remaining.split(' ')[0]) / parseFloat(nft.duration.split(' ')[0])) * 100);
            nftsHTML += `
                <div class="mini-nft-card">
                    <div class="mini-nft-header">
                        <h5>${nft.name}</h5>
                        <span class="mini-status active">Active</span>
                    </div>
                    <div class="mini-nft-info">
                        <p><i class="fas fa-map-marker-alt"></i> ${nft.location}</p>
                        <p><i class="fas fa-calendar"></i> ${nft.remaining} left</p>
                        <p><i class="fas fa-coins"></i> ₩${nft.escrowed.toLocaleString()} escrowed</p>
                    </div>
                    <div class="mini-progress">
                        <div class="mini-progress-bar">
                            <div class="mini-progress-fill" style="width: ${progressPercent}%"></div>
                        </div>
                        <span class="mini-progress-text">${progressPercent}%</span>
                    </div>
                    <div class="mini-nft-actions">
                        <button class="mini-btn view" onclick="showNFTDetails('${nft.id}')">View</button>
                        <button class="mini-btn transfer" onclick="transferNFT('${nft.id}')">Transfer</button>
                        <button class="mini-btn sell" onclick="sellNFT('${nft.id}')">Sell</button>
                    </div>
                </div>
            `;
        });
        
        membershipCard.innerHTML = `
            <div class="card-header">
                <h3>My Memberships (${userStorage.ownedNFTs.length})</h3>
                <span class="status active">Active</span>
            </div>
            <div class="multiple-nfts-summary">
                <div class="summary-stats">
                    <div class="summary-stat">
                        <span class="stat-label">Total NFTs:</span>
                        <span class="stat-value">${userStorage.ownedNFTs.length}</span>
                    </div>
                    <div class="summary-stat">
                        <span class="stat-label">Total Escrowed:</span>
                        <span class="stat-value highlight">₩${totalEscrowed.toLocaleString()}</span>
                    </div>
                </div>
            </div>
            <div class="nfts-grid">
                ${nftsHTML}
            </div>
        `;
    }
}

function updateMarketplace() {
    const nftGrid = document.querySelector('.nft-grid');
    if (!nftGrid) return;
    
    // Add user's listed NFTs to the marketplace
    let marketplaceHTML = '';
    
    // Add user's listings first
    userStorage.listedNFTs.forEach(listing => {
        const nft = listing.nft;
        const progressPercent = Math.round((parseFloat(nft.remaining.split(' ')[0]) / parseFloat(nft.duration.split(' ')[0])) * 100);
        const savings = Math.round((nft.originalPrice - listing.price) / nft.originalPrice * 100);
        
        marketplaceHTML += `
            <div class="nft-card" style="border: 2px solid #28a745;">
                <div class="hot-badge" style="background: #28a745;">🏷️ Your Listing</div>
                <img src="https://via.placeholder.com/150x100" alt="NFT" class="nft-image">
                <div class="nft-info">
                    <div class="nft-header">
                        <h4>${nft.name}</h4>
                    </div>
                    <p class="nft-location">${nft.location} Location</p>
                    <div class="nft-details">
                        <div class="detail-row">
                            <span class="label">Duration:</span>
                            <span class="value">${nft.duration}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Expires:</span>
                            <span class="value">${nft.expires}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Remaining:</span>
                            <span class="value remaining">${nft.remaining}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Escrowed:</span>
                            <span class="value escrowed">₩${nft.escrowed.toLocaleString()}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Insurance:</span>
                            <span class="value insured">✅ Protected</span>
                        </div>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressPercent}%"></div>
                    </div>
                    <div class="price-comparison">
                        <div class="official-price">
                            <span class="price-label">Original Price:</span>
                            <span class="price-value original">₩${nft.originalPrice.toLocaleString()}</span>
                        </div>
                        <div class="marketplace-price">
                            <span class="price-label">Your Price:</span>
                            <span class="price-value current">₩${listing.price.toLocaleString()}</span>
                        </div>
                        ${savings > 0 ? `<div class="savings">
                            <span class="savings-badge">Save ₩${(nft.originalPrice - listing.price).toLocaleString()} (${savings}%)</span>
                        </div>` : ''}
                    </div>
                    <button class="buy-btn" onclick="cancelListing('${listing.id}')" style="background: #dc3545;">Cancel Listing</button>
                </div>
            </div>
        `;
    });
    
    // Store the original marketplace HTML (without user listings)
    if (!window.originalMarketplaceHTML) {
        window.originalMarketplaceHTML = nftGrid.innerHTML;
    }
    
    // Add the original marketplace items after user listings
    nftGrid.innerHTML = marketplaceHTML + window.originalMarketplaceHTML;
}

function showNFTDetails(nftId) {
    const nft = userStorage.ownedNFTs.find(n => n.id === nftId);
    if (!nft) return;
    
    const progressPercent = Math.round((parseFloat(nft.remaining.split(' ')[0]) / parseFloat(nft.duration.split(' ')[0])) * 100);
    
    const detailsModal = `
        <div class="modal active" id="nft-details-modal">
            <div class="modal-content nft-details-content">
                <div class="modal-header">
                    <h3>NFT Membership Details</h3>
                    <button class="close-btn" onclick="closeNFTDetailsModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="nft-details-card">
                        <div class="nft-details-header">
                            <div class="nft-image-placeholder">
                                <i class="fas fa-dumbbell"></i>
                            </div>
                            <div class="nft-title-info">
                                <h4>${nft.name}</h4>
                                <p class="nft-id">ID: ${nft.id}</p>
                                <div class="nft-status-badges">
                                    <span class="status-badge active">Active</span>
                                    ${nft.transferable ? '<span class="feature-badge">Transferable</span>' : ''}
                                    ${nft.refundable ? '<span class="feature-badge">Refundable</span>' : ''}
                                    ${nft.insured ? '<span class="feature-badge">Insured</span>' : ''}
                                </div>
                            </div>
                        </div>
                        
                        <div class="nft-details-grid">
                            <div class="detail-section">
                                <h5><i class="fas fa-map-marker-alt"></i> Location</h5>
                                <p>${nft.gym}</p>
                                <p class="detail-sub">${nft.location}</p>
                            </div>
                            
                            <div class="detail-section">
                                <h5><i class="fas fa-calendar"></i> Membership Period</h5>
                                <p>Duration: ${nft.duration}</p>
                                <p class="detail-sub">Remaining: ${nft.remaining}</p>
                                <p class="detail-sub">Expires: ${nft.expires}</p>
                            </div>
                            
                            <div class="detail-section">
                                <h5><i class="fas fa-coins"></i> Financial Details</h5>
                                <p>Original Price: ₩${nft.originalPrice.toLocaleString()}</p>
                                <p class="detail-highlight">Escrowed Funds: ₩${nft.escrowed.toLocaleString()}</p>
                                <p class="detail-sub">Purchased: ${nft.purchaseDate}</p>
                            </div>
                            
                            <div class="detail-section">
                                <h5><i class="fas fa-chart-line"></i> Usage Progress</h5>
                                <div class="detail-progress">
                                    <div class="detail-progress-bar">
                                        <div class="detail-progress-fill" style="width: ${progressPercent}%"></div>
                                    </div>
                                    <p>${progressPercent}% of membership remaining</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="nft-actions-full">
                            <button class="action-btn-full primary" onclick="closeNFTDetailsModal(); transferNFT('${nft.id}')">
                                <i class="fas fa-paper-plane"></i>
                                Transfer NFT
                            </button>
                            <button class="action-btn-full secondary" onclick="closeNFTDetailsModal(); sellNFT('${nft.id}')">
                                <i class="fas fa-store"></i>
                                List for Sale
                            </button>
                            <button class="action-btn-full tertiary" onclick="requestRefund('${nft.id}')">
                                <i class="fas fa-undo"></i>
                                Request Refund
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('nft-details-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    document.body.insertAdjacentHTML('beforeend', detailsModal);
}

function closeNFTDetailsModal() {
    const modal = document.getElementById('nft-details-modal');
    if (modal) {
        modal.remove();
    }
}

function requestRefund(nftId) {
    const nft = userStorage.ownedNFTs.find(n => n.id === nftId);
    if (!nft) return;
    
    if (!nft.refundable) {
        showErrorPopup('This NFT is not eligible for refund.');
        return;
    }
    
    const refundAmount = Math.round(nft.escrowed * 0.9); // 90% refund after fees
    
    const confirmMessage = `Request refund for ${nft.name}?\n\nYou will receive: ₩${refundAmount.toLocaleString()}\n(10% processing fee applied)\n\nThis action cannot be undone.`;
    
    showConfirmPopup('Confirm Refund', confirmMessage, () => {
        // Remove NFT from owned
        userStorage.ownedNFTs = userStorage.ownedNFTs.filter(n => n.id !== nftId);
        
        // Add refund amount to balance
        userStorage.balance += refundAmount;
        
        // Add transaction
        userStorage.transactionHistory.push({
            type: 'refund',
            nftId: nft.id,
            amount: refundAmount,
            date: new Date().toISOString(),
            description: `Refunded ${nft.name} - ₩${refundAmount.toLocaleString()}`
        });
        
        saveUserStorage();
        updateUI();
        closeNFTDetailsModal();
        
        showSuccessPopup(`✅ Refund processed successfully!\n\nRefund amount: ₩${refundAmount.toLocaleString()}\nNew balance: ₩${userStorage.balance.toLocaleString()}`);
    });
}

function cancelListing(listingId) {
    const listing = userStorage.listedNFTs.find(l => l.id === listingId);
    if (!listing) return;
    
    showConfirmPopup('Cancel Listing', `Cancel listing for ${listing.nft.name}?`, () => {
        // Move NFT back to owned
        userStorage.ownedNFTs.push(listing.nft);
        
        // Remove from listings
        userStorage.listedNFTs = userStorage.listedNFTs.filter(l => l.id !== listingId);
        
        // Add transaction
        userStorage.transactionHistory.push({
            type: 'cancel_listing',
            nftId: listing.nftId,
            amount: 0,
            date: new Date().toISOString(),
            description: `Cancelled listing for ${listing.nft.name}`
        });
        
        saveUserStorage();
        updateUI();
        
        showSuccessPopup('Listing cancelled successfully!');
    });
}

function updateProfile() {
    const settingsList = document.querySelector('.settings-list');
    if (!settingsList) return;
    
    // Calculate user statistics
    const totalNFTs = userStorage.ownedNFTs.length + userStorage.listedNFTs.length;
    const totalEscrowed = userStorage.ownedNFTs.reduce((sum, nft) => sum + nft.escrowed, 0) + 
                         userStorage.listedNFTs.reduce((sum, listing) => sum + listing.nft.escrowed, 0);
    const totalTransactions = userStorage.transactionHistory.length;
    
    // Add statistics section before existing settings
    const statsHTML = `
        <div class="profile-stats" style="background: white; border-radius: 15px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h3 style="margin-bottom: 15px; color: #333;">Your Statistics</h3>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                <div style="text-align: center; padding: 15px; background: #f8f9fa; border-radius: 10px;">
                    <div style="font-size: 1.5rem; font-weight: 700; color: #667eea;">${totalNFTs}</div>
                    <div style="font-size: 0.9rem; color: #666;">Total NFTs</div>
                </div>
                <div style="text-align: center; padding: 15px; background: #f8f9fa; border-radius: 10px;">
                    <div style="font-size: 1.5rem; font-weight: 700; color: #28a745;">₩${userStorage.balance.toLocaleString()}</div>
                    <div style="font-size: 0.9rem; color: #666;">Wallet Balance</div>
                </div>
                <div style="text-align: center; padding: 15px; background: #f8f9fa; border-radius: 10px;">
                    <div style="font-size: 1.5rem; font-weight: 700; color: #ffc107;">₩${totalEscrowed.toLocaleString()}</div>
                    <div style="font-size: 0.9rem; color: #666;">Total Escrowed</div>
                </div>
                <div style="text-align: center; padding: 15px; background: #f8f9fa; border-radius: 10px;">
                    <div style="font-size: 1.5rem; font-weight: 700; color: #17a2b8;">${totalTransactions}</div>
                    <div style="font-size: 0.9rem; color: #666;">Transactions</div>
                </div>
            </div>
        </div>
    `;
    
    // Insert stats before the settings list
    const existingStats = document.querySelector('.profile-stats');
    if (existingStats) {
        existingStats.remove();
    }
    settingsList.insertAdjacentHTML('beforebegin', statsHTML);
    
    // Add dynamic menu items
    const dynamicItems = `
        <div class="setting-item" onclick="showMyNFTs()">
            <i class="fas fa-wallet"></i>
            <span>My NFT Collection (${userStorage.ownedNFTs.length})</span>
            <i class="fas fa-chevron-right"></i>
        </div>
        <div class="setting-item" onclick="showTransactionHistory()">
            <i class="fas fa-history"></i>
            <span>Transaction History (${totalTransactions})</span>
            <i class="fas fa-chevron-right"></i>
        </div>
        ${userStorage.listedNFTs.length > 0 ? `
        <div class="setting-item" onclick="showListedNFTs()">
            <i class="fas fa-store"></i>
            <span>My Listings (${userStorage.listedNFTs.length})</span>
            <i class="fas fa-chevron-right"></i>
        </div>` : ''}
    `;
    
    // Remove existing dynamic items and add new ones
    const existingDynamicItems = settingsList.querySelectorAll('.dynamic-item');
    existingDynamicItems.forEach(item => item.remove());
    
    // Insert dynamic items after QR code item
    const qrItem = settingsList.querySelector('.setting-item');
    if (qrItem) {
        qrItem.insertAdjacentHTML('afterend', dynamicItems.replace(/class="setting-item"/g, 'class="setting-item dynamic-item"'));
    }
    
    // Add reset demo button at the end
    const resetButton = `
        <div class="setting-item dynamic-item reset-demo-item" onclick="resetDemo()">
            <i class="fas fa-refresh"></i>
            <span>Reset Demo Data</span>
            <i class="fas fa-chevron-right"></i>
        </div>
    `;
    
    settingsList.insertAdjacentHTML('beforeend', resetButton);
}

function showListedNFTs() {
    let message = `🏪 My Listed NFTs (${userStorage.listedNFTs.length})\n\n`;
    
    if (userStorage.listedNFTs.length === 0) {
        message += 'No NFTs currently listed for sale.';
    } else {
        userStorage.listedNFTs.forEach((listing, index) => {
            const listedDate = new Date(listing.listedDate).toLocaleDateString();
            message += `${index + 1}. ${listing.nft.name}\n`;
            message += `   Price: ₩${listing.price.toLocaleString()}\n`;
            message += `   Listed: ${listedDate}\n`;
            message += `   Instant Sale: ${listing.instantSale ? 'Yes' : 'No'}\n`;
            message += `   Negotiable: ${listing.negotiable ? 'Yes' : 'No'}\n\n`;
        });
    }
    
    alert(message);
}

// Authentication Functions
function loginWithLine() {
    console.log('loginWithLine function called');
    showLoadingState();
    
    setTimeout(() => {
        currentUser = {
            id: 'line_user_123',
            name: 'John Doe',
            email: 'john.doe@email.com',
            avatar: 'https://via.placeholder.com/60'
        };
        
        localStorage.setItem('gympass_user', JSON.stringify(currentUser));
        showMainApp();
    }, 2000);
}

function logout() {
    localStorage.removeItem('gympass_user');
    currentUser = null;
    showLoginScreen();
}

function showLoadingState() {
    const loginBtn = document.querySelector('.line-login-btn');
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    loginBtn.disabled = true;
}

// Screen Navigation
function showLoginScreen() {
    document.getElementById('login-screen').classList.add('active');
    document.getElementById('main-app').classList.remove('active');
}

function showMainApp() {
    document.getElementById('login-screen').classList.remove('active');
    document.getElementById('main-app').classList.add('active');
    showPage('home');
    // Trigger dynamic UI updates after a short delay to ensure DOM is ready
    setTimeout(() => {
        updateUI();
    }, 100);
}

// Page Navigation
function showPage(pageName) {
    console.log('showPage function called with:', pageName);
    
    // Check if user is logged in and main app is visible
    if (!currentUser || !document.getElementById('main-app').classList.contains('active')) {
        console.log('User not logged in, cannot navigate to:', pageName);
        return;
    }
    
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    const targetPage = document.getElementById(pageName + '-page');
    if (!targetPage) {
        console.error('Page not found:', pageName + '-page');
        return;
    }
    targetPage.classList.add('active');
    
    // Update navigation only for main nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const navItem = document.querySelector(`[onclick="showPage('${pageName}')\"]`);
    if (navItem && navItem.classList.contains('nav-item')) {
        navItem.classList.add('active');
    }
    
    // Update page title
    const titles = {
        'home': 'Home',
        'find-gym': 'Find Gym',
        'marketplace': 'Marketplace',
        'profile': 'Profile',
        'gym-detail': 'Gym Details'
    };
    
    const pageTitleElement = document.getElementById('page-title');
    if (pageTitleElement) {
        pageTitleElement.textContent = titles[pageName] || 'GymPass NFT';
    }
    currentPage = pageName;
    
    // Update dynamic content based on current page
    if (pageName === 'home') {
        setTimeout(() => updateMembershipCard(), 50);
    } else if (pageName === 'marketplace') {
        setTimeout(() => updateMarketplace(), 50);
    } else if (pageName === 'profile') {
        setTimeout(() => updateProfile(), 50);
    }
}

// Gym Details Modal (for modal view)
function showGymModal(gymName) {
    document.getElementById('modal-gym-name').textContent = gymName;
    document.getElementById('gym-modal').classList.add('active');
}

function closeModal() {
    document.getElementById('gym-modal').classList.remove('active');
}

function showMarketplace(gymName) {
    showPage('marketplace');
    // Filter marketplace by gym name
    const searchInput = document.getElementById('nft-search');
    searchInput.value = gymName;
    filterMarketplace();
}

// Search and Filter Functions
function filterMarketplace() {
    const searchTerm = document.getElementById('nft-search').value.toLowerCase();
    const locationFilter = document.getElementById('location-filter').value;
    const brandFilter = document.getElementById('brand-filter').value;
    const sortFilter = document.getElementById('sort-filter').value;
    
    // Mock filtering logic
    console.log('Filtering marketplace:', {
        search: searchTerm,
        location: locationFilter,
        brand: brandFilter,
        sort: sortFilter
    });
}

// Event Listeners
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal') && !e.target.classList.contains('modal-content')) {
        closeModal();
    }
});

// Search functionality
document.getElementById('gym-search')?.addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    console.log('Searching gyms:', searchTerm);
});

document.getElementById('nft-search')?.addEventListener('input', filterMarketplace);
document.getElementById('location-filter')?.addEventListener('change', filterMarketplace);
document.getElementById('brand-filter')?.addEventListener('change', filterMarketplace);
document.getElementById('sort-filter')?.addEventListener('change', filterMarketplace);

// Filter tabs
document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
    });
});

// Mock data and functions
const mockGyms = [
    {
        name: 'PowerFit Gym',
        distance: '0.5 km',
        price: '₩120,000/month',
        available: true
    },
    {
        name: 'FlexZone Studio',
        distance: '1.2 km',
        price: '₩95,000/month',
        available: true
    },
    {
        name: 'Elite Fitness',
        distance: '2.1 km',
        price: '₩155,000/month',
        available: false
    }
];

const mockNFTs = [
    {
        name: 'PowerFit Premium Pass',
        location: 'Downtown',
        price: '₩650,000',
        distance: '0.8 km',
        duration: '6 months',
        remaining: '4.2 months',
        escrowed: '₩420,000',
        progress: 70
    },
    {
        name: 'FlexZone Annual Pass',
        location: 'Uptown',
        price: '₩390,000',
        distance: '1.5 km',
        duration: '12 months',
        remaining: '8.5 months',
        escrowed: '₩680,000',
        progress: 71
    },
    {
        name: 'Elite Fitness VIP',
        location: 'Downtown',
        price: '₩1,560,000',
        distance: '2.1 km',
        duration: '24 months',
        remaining: '18.3 months',
        escrowed: '₩2,440,000',
        progress: 76
    },
    {
        name: 'BodyZone 3-Month Pass',
        location: 'Gangnam',
        price: '₩180,000',
        distance: '3.2 km',
        duration: '3 months',
        remaining: '1.8 months',
        escrowed: '₩144,000',
        progress: 60
    },
    {
        name: 'FitMax Weekly Pass',
        location: 'Hongdae',
        price: '₩85,000',
        distance: '2.8 km',
        duration: '1 month',
        remaining: '3 weeks',
        escrowed: '₩75,000',
        progress: 75
    },
    {
        name: 'MegaGym Lifetime Pass',
        location: 'Itaewon',
        price: '₩12,000,000',
        distance: '4.1 km',
        duration: 'Lifetime',
        remaining: 'Unlimited',
        escrowed: '₩8,500,000',
        progress: 100
    }
];

// Simulate buying NFT
function buyNFT(nftName) {
    alert(`Purchasing ${nftName}... This would integrate with your crypto wallet.`);
}

// Mint NFT Membership
function mintNFT(gymName, membershipType, price, duration) {
    const priceNum = parseInt(price.replace(/[₩,]/g, ''));
    
    if (userStorage.balance < priceNum) {
        alert('Insufficient balance. Please deposit more KRW first.');
        return;
    }
    
    // Deduct balance
    userStorage.balance -= priceNum;
    
    // Create new NFT
    const newNFT = {
        id: 'GYM' + Date.now(),
        name: `${gymName} - ${membershipType}`,
        gym: gymName,
        location: getGymLocation(gymName),
        duration: duration,
        remaining: duration,
        expires: getExpiryDate(duration),
        escrowed: Math.round(priceNum * 0.8), // 80% escrowed
        originalPrice: priceNum,
        progress: 100,
        purchaseDate: new Date().toISOString().split('T')[0],
        transferable: true,
        refundable: true,
        insured: true
    };
    
    userStorage.ownedNFTs.push(newNFT);
    
    // Add transaction
    userStorage.transactionHistory.push({
        type: 'mint',
        nftId: newNFT.id,
        amount: priceNum,
        date: new Date().toISOString(),
        description: `Minted ${newNFT.name}`
    });
    
    saveUserStorage();
    updateUI();
    
    showSuccessPopup(`🎉 NFT Minted Successfully!\n\nYou now own: ${newNFT.name}\nNFT ID: ${newNFT.id}\nEscrowed: ₩${newNFT.escrowed.toLocaleString()}\n\nThe NFT has been added to your wallet!`);
}

function getGymLocation(gymName) {
    const locations = {
        'PowerFit Gym': 'Downtown',
        'FlexZone Studio': 'Uptown', 
        'Elite Fitness': 'Downtown',
        'BodyZone': 'Gangnam',
        'FitMax': 'Hongdae',
        'MegaGym': 'Itaewon'
    };
    return locations[gymName] || 'Seoul';
}

function getExpiryDate(duration) {
    const now = new Date();
    const months = parseInt(duration.split(' ')[0]);
    now.setMonth(now.getMonth() + months);
    return now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Simulate buying membership (legacy function)
function buyMembership(gymName) {
    mintNFT(gymName, 'Premium Pass', '₩480,000', '6 months');
}

// QR Code Modal Functions
function showQRCode() {
    document.getElementById('qr-modal').classList.add('active');
}

function closeQRModal() {
    document.getElementById('qr-modal').classList.remove('active');
}

// Deposit Modal Functions
function showDepositModal() {
    document.getElementById('deposit-modal').classList.add('active');
}

function closeDepositModal() {
    document.getElementById('deposit-modal').classList.remove('active');
}


// Deposit tab switching
function switchDepositTab(tabType, event) {
    // Update tab buttons
    document.querySelectorAll('.deposit-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Show/hide payment options
    document.querySelectorAll('.payment-options').forEach(option => {
        option.classList.remove('active');
    });
    
    if (tabType === 'web2') {
        document.getElementById('web2-options').classList.add('active');
    } else {
        document.getElementById('crypto-options').classList.add('active');
    }
}

// Payment method selection
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('payment-btn')) {
        document.querySelectorAll('.payment-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        e.target.classList.add('active');
    }
    
    // Connect wallet functionality
    if (e.target.classList.contains('connect-wallet-btn')) {
        connectCryptoWallet();
    }
});

// Crypto wallet connection
function connectCryptoWallet() {
    // Simulate wallet connection
    const walletBtn = document.querySelector('.connect-wallet-btn');
    walletBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
    
    setTimeout(() => {
        walletBtn.innerHTML = '<i class="fas fa-check"></i> Wallet Connected';
        walletBtn.style.background = '#28a745';
        
        // Show wallet address
        setTimeout(() => {
            walletBtn.innerHTML = '<i class="fas fa-wallet"></i> 0xABC...DEF';
        }, 1000);
    }, 2000);
}

// NFT Transfer functionality
function transferNFT(nftId = null) {
    // Store the NFT ID for the transfer process
    if (nftId) {
        window.selectedNFTForTransfer = nftId;
    } else {
        // Default to first NFT if no ID provided
        window.selectedNFTForTransfer = userStorage.ownedNFTs[0]?.id;
    }
    
    // Find the selected NFT
    const selectedNFT = userStorage.ownedNFTs.find(nft => nft.id === window.selectedNFTForTransfer);
    if (!selectedNFT) {
        alert('NFT not found');
        return;
    }
    
    const transferModal = `
        <div class="modal active" id="transfer-modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Transfer NFT Membership</h3>
                    <button class="close-btn" onclick="closeTransferModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="transfer-form">
                        <div class="nft-preview">
                            <h4>${selectedNFT.name}</h4>
                            <p>NFT ID: ${selectedNFT.id}</p>
                            <div class="transfer-escrow-info">
                                <div class="escrow-detail">
                                    <span>Remaining Term:</span>
                                    <span>${selectedNFT.remaining}</span>
                                </div>
                                <div class="escrow-detail">
                                    <span>Escrowed Funds:</span>
                                    <span class="highlight">₩${selectedNFT.escrowed.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                        <div class="transfer-input">
                            <label>Recipient Wallet Address</label>
                            <input type="text" placeholder="0x..." id="recipient-address">
                            <small>Enter the wallet address to transfer this NFT membership</small>
                        </div>
                        <button class="confirm-transfer-btn" onclick="processTransfer()">Transfer NFT</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', transferModal);
}

function processTransfer() {
    const recipientAddress = document.getElementById('recipient-address').value;
    
    if (!recipientAddress) {
        alert('Please enter recipient wallet address');
        return;
    }
    
    if (recipientAddress.length < 10) {
        alert('Please enter a valid wallet address');
        return;
    }
    
    // Find the NFT to transfer using the selected ID
    const nftToTransfer = userStorage.ownedNFTs.find(nft => nft.id === window.selectedNFTForTransfer);
    if (!nftToTransfer) {
        alert('No NFT found to transfer');
        return;
    }
    
    // Remove NFT from owned
    userStorage.ownedNFTs = userStorage.ownedNFTs.filter(nft => nft.id !== nftToTransfer.id);
    
    // Add transaction
    userStorage.transactionHistory.push({
        type: 'transfer',
        nftId: nftToTransfer.id,
        amount: 0,
        date: new Date().toISOString(),
        description: `Transferred ${nftToTransfer.name} to ${recipientAddress.substring(0, 10)}...`
    });
    
    saveUserStorage();
    updateUI();
    
    alert(`NFT membership transferred to ${recipientAddress}\n\nThe recipient will receive:\n- ${nftToTransfer.name}\n- ${nftToTransfer.remaining} remaining\n- ₩${nftToTransfer.escrowed.toLocaleString()} in escrowed funds\n\nTransfer completed successfully!`);
    closeTransferModal();
}

function closeTransferModal() {
    const modal = document.getElementById('transfer-modal');
    if (modal) modal.remove();
}

// Enhanced deposit confirmation with crypto support
function confirmDeposit() {
    const amount = document.getElementById('deposit-amount').value;
    const isWeb2 = document.querySelector('.deposit-tab.active').textContent.includes('Web2');
    
    if (amount && amount >= 1000) {
        const depositAmount = parseInt(amount);
        
        if (isWeb2) {
            alert(`Depositing ₩${depositAmount.toLocaleString()} KRW via traditional payment...`);
        } else {
            alert(`Converting crypto to ₩${depositAmount.toLocaleString()} KRW stablecoin...`);
        }
        
        closeDepositModal();
        
        // Update balance in storage
        setTimeout(() => {
            userStorage.balance += depositAmount;
            
            // Add transaction
            userStorage.transactionHistory.push({
                type: 'deposit',
                nftId: null,
                amount: depositAmount,
                date: new Date().toISOString(),
                description: `Deposited ₩${depositAmount.toLocaleString()} via ${isWeb2 ? 'Web2' : 'Crypto'}`
            });
            
            saveUserStorage();
            updateUI();
            
            alert(`✅ Deposit successful!\nNew balance: ₩${userStorage.balance.toLocaleString()}`);
        }, 1000);
    } else {
        alert('Please enter a valid amount (minimum ₩1,000)');
    }
}

// Gym Detail Page Functions
function showGymDetails(gymName) {
    if (!currentUser) {
        console.log('User not logged in, cannot show gym details');
        return;
    }
    document.getElementById('modal-gym-name').textContent = gymName;
    document.getElementById('gym-detail-name').textContent = gymName;
    showPage('gym-detail');
}

// Investment Modal Functions
function showInvestModal() {
    document.getElementById('investment-modal').classList.add('active');
}

function closeInvestModal() {
    document.getElementById('investment-modal').classList.remove('active');
}

function confirmInvestment() {
    const amount = document.getElementById('investment-amount').value;
    if (amount && amount >= 100000) {
        alert(`Investment of ₩${parseInt(amount).toLocaleString()} confirmed!\nYou will earn approximately ₩${Math.round(amount * 0.085 / 2).toLocaleString()} in 6 months.`);
        closeInvestModal();
    } else {
        alert('Please enter a valid amount (minimum ₩100,000)');
    }
}

// Investment Calculator
document.addEventListener('input', function(e) {
    if (e.target.id === 'investment-amount') {
        const amount = parseFloat(e.target.value) || 0;
        const sixMonthReturn = Math.round(amount * 0.085 / 2);
        const totalReturn = amount + sixMonthReturn;
        
        document.getElementById('projected-return').textContent = `₩${sixMonthReturn.toLocaleString()}`;
        document.getElementById('total-return').textContent = `₩${totalReturn.toLocaleString()}`;
    }
});

// Update gym card click handlers
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('primary-btn') && e.target.textContent === 'View Details') {
        e.preventDefault();
        const gymCard = e.target.closest('.gym-card');
        const gymName = gymCard.querySelector('h4').textContent;
        showGymDetails(gymName);
    }
});

// Buy Modal Functions
let currentNFTData = {};

function showBuyModal(nftName, price, remaining, escrowed) {
    currentNFTData = { nftName, price, remaining, escrowed };
    
    document.getElementById('buy-nft-name').textContent = nftName;
    document.getElementById('buy-remaining').textContent = remaining;
    document.getElementById('buy-escrowed').textContent = escrowed;
    document.getElementById('buy-price').textContent = price;
    
    // Calculate fees and total
    const priceNum = parseInt(price.replace(/[₩,]/g, ''));
    const fee = Math.round(priceNum * 0.02);
    const total = priceNum + fee;
    
    document.getElementById('summary-price').textContent = price;
    document.getElementById('summary-fee').textContent = `₩${fee.toLocaleString()}`;
    document.getElementById('summary-total').textContent = `₩${total.toLocaleString()}`;
    
    document.getElementById('buy-modal').classList.add('active');
}

function closeBuyModal() {
    document.getElementById('buy-modal').classList.remove('active');
}

function confirmPurchase() {
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    const total = document.getElementById('summary-total').textContent;
    const totalNum = parseInt(total.replace(/[₩,]/g, ''));
    
    if (paymentMethod === 'wallet') {
        // Check if sufficient balance
        if (totalNum > userStorage.balance) {
            showErrorPopup('Insufficient balance. Please deposit more KRW or choose "Deposit & Buy" option.');
            return;
        }
    }
    
    // Simulate purchase process
    const purchaseSteps = [
        'Verifying payment...',
        'Processing NFT transfer...',
        'Updating escrow contract...',
        'Finalizing ownership...'
    ];
    
    let currentStep = 0;
    const btn = document.querySelector('.confirm-purchase-btn');
    const originalText = btn.textContent;
    
    const processStep = () => {
        if (currentStep < purchaseSteps.length) {
            btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${purchaseSteps[currentStep]}`;
            currentStep++;
            setTimeout(processStep, 1500);
        } else {
            btn.innerHTML = '<i class="fas fa-check"></i> Purchase Complete!';
            btn.style.background = '#28a745';
            
            setTimeout(() => {
                // Actually purchase the NFT
                purchaseNFT(currentNFTData, totalNum);
                
                showSuccessPopup(`🎉 Congratulations!\n\nYou now own: ${currentNFTData.nftName}\nRemaining term: ${currentNFTData.remaining}\nEscrowed funds: ${currentNFTData.escrowed}\n\nThe NFT has been transferred to your wallet!`);
                closeBuyModal();
                btn.textContent = originalText;
                btn.style.background = '';
            }, 2000);
        }
    };
    
    processStep();
}

function purchaseNFT(nftData, totalAmount) {
    // Deduct balance
    userStorage.balance -= totalAmount;
    
    // Create purchased NFT
    const purchasedNFT = {
        id: 'GYM' + Date.now(),
        name: nftData.nftName,
        gym: nftData.nftName.split(' ')[0] + ' ' + nftData.nftName.split(' ')[1],
        location: getLocationFromNFTName(nftData.nftName),
        duration: getDurationFromRemaining(nftData.remaining),
        remaining: nftData.remaining,
        expires: getExpiryFromRemaining(nftData.remaining),
        escrowed: parseInt(nftData.escrowed.replace(/[₩,]/g, '')),
        originalPrice: totalAmount,
        progress: calculateProgress(nftData.remaining),
        purchaseDate: new Date().toISOString().split('T')[0],
        transferable: true,
        refundable: true,
        insured: true
    };
    
    userStorage.ownedNFTs.push(purchasedNFT);
    
    // Add transaction
    userStorage.transactionHistory.push({
        type: 'buy',
        nftId: purchasedNFT.id,
        amount: totalAmount,
        date: new Date().toISOString(),
        description: `Purchased ${purchasedNFT.name} from marketplace`
    });
    
    saveUserStorage();
    updateUI();
}

function getLocationFromNFTName(nftName) {
    if (nftName.includes('Downtown')) return 'Downtown';
    if (nftName.includes('Uptown')) return 'Uptown';
    if (nftName.includes('Gangnam')) return 'Gangnam';
    if (nftName.includes('Hongdae')) return 'Hongdae';
    if (nftName.includes('Itaewon')) return 'Itaewon';
    return 'Seoul';
}

function getDurationFromRemaining(remaining) {
    const months = parseFloat(remaining.split(' ')[0]);
    if (months < 1) return '1 month';
    if (months < 12) return Math.ceil(months) + ' months';
    return Math.ceil(months / 12) + ' years';
}

function getExpiryFromRemaining(remaining) {
    const now = new Date();
    const months = parseFloat(remaining.split(' ')[0]);
    now.setMonth(now.getMonth() + months);
    return now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function calculateProgress(remaining) {
    const months = parseFloat(remaining.split(' ')[0]);
    if (months > 12) return 90;
    if (months > 6) return 70;
    if (months > 3) return 50;
    return 30;
}

function redirectToGym() {
    closeBuyModal();
    // Extract gym name from NFT name
    const gymName = currentNFTData.nftName.split(' ')[0] + ' ' + currentNFTData.nftName.split(' ')[1];
    showGymDetails(gymName);
}

// Enhanced marketplace filtering
function filterMarketplace() {
    const searchTerm = document.getElementById('nft-search').value.toLowerCase();
    const locationFilter = document.getElementById('location-filter').value;
    const brandFilter = document.getElementById('brand-filter').value;
    const sortFilter = document.getElementById('sort-filter').value;
    
    console.log('Filtering marketplace:', {
        search: searchTerm,
        location: locationFilter,
        brand: brandFilter,
        sort: sortFilter
    });
    
    // Show filtering feedback
    const nftCards = document.querySelectorAll('.nft-card');
    nftCards.forEach(card => {
        card.style.opacity = '0.7';
        setTimeout(() => {
            card.style.opacity = '1';
        }, 300);
    });
}

// Payment method change handler
document.addEventListener('change', function(e) {
    if (e.target.name === 'payment') {
        const walletOption = document.querySelector('input[value="wallet"]');
        const depositOption = document.querySelector('input[value="deposit"]');
        
        if (e.target.value === 'deposit') {
            // Show deposit flow hint
            const btn = document.querySelector('.confirm-purchase-btn');
            btn.textContent = 'Deposit & Purchase';
        } else {
            const btn = document.querySelector('.confirm-purchase-btn');
            btn.textContent = 'Confirm Purchase';
        }
    }
});

// Sell NFT Functions
function sellNFT(nftId = null) {
    // Store the NFT ID for the sell process
    if (nftId) {
        window.selectedNFTForSell = nftId;
    } else {
        // Default to first NFT if no ID provided
        window.selectedNFTForSell = userStorage.ownedNFTs[0]?.id;
    }
    document.getElementById('sell-modal').classList.add('active');
    // Reset form
    document.getElementById('sell-price').value = '';
    updateSellFees();
}

function closeSellModal() {
    document.getElementById('sell-modal').classList.remove('active');
}

function setSellPrice(price) {
    document.getElementById('sell-price').value = price;
    
    // Update button selection
    document.querySelectorAll('.price-option').forEach(btn => {
        btn.classList.remove('selected');
    });
    event.target.classList.add('selected');
    
    updateSellFees();
}

function updateSellFees() {
    const price = parseInt(document.getElementById('sell-price').value) || 0;
    const platformFee = Math.round(price * 0.02);
    const sellerReceives = price - platformFee;
    
    document.getElementById('platform-fee').textContent = `₩${platformFee.toLocaleString()}`;
    document.getElementById('seller-receives').textContent = `₩${sellerReceives.toLocaleString()}`;
}

function confirmSell() {
    const price = document.getElementById('sell-price').value;
    const instantSale = document.getElementById('instant-sale').checked;
    const negotiable = document.getElementById('negotiable').checked;
    
    if (!price || price < 100000) {
        showErrorPopup('Please enter a valid price (minimum ₩100,000)');
        return;
    }
    
    // Find the NFT to sell using the selected ID
    const nftToSell = userStorage.ownedNFTs.find(nft => nft.id === window.selectedNFTForSell);
    if (!nftToSell) {
        showErrorPopup('No NFT found to sell');
        return;
    }
    
    const platformFee = Math.round(price * 0.02);
    const sellerReceives = parseInt(price) - platformFee;
    
    // Create listing
    const listing = {
        id: 'LISTING' + Date.now(),
        nftId: nftToSell.id,
        nft: { ...nftToSell },
        price: parseInt(price),
        instantSale: instantSale,
        negotiable: negotiable,
        listedDate: new Date().toISOString(),
        status: 'active'
    };
    
    userStorage.listedNFTs.push(listing);
    
    // Remove NFT from owned (it's now listed)
    userStorage.ownedNFTs = userStorage.ownedNFTs.filter(nft => nft.id !== nftToSell.id);
    
    // Add transaction
    userStorage.transactionHistory.push({
        type: 'list',
        nftId: nftToSell.id,
        amount: parseInt(price),
        date: new Date().toISOString(),
        description: `Listed ${nftToSell.name} for sale`
    });
    
    saveUserStorage();
    updateUI();
    
    let message = `🎉 Your NFT is now listed for sale!\n\n`;
    message += `NFT: ${nftToSell.name}\n`;
    message += `Listing Price: ₩${parseInt(price).toLocaleString()}\n`;
    message += `You'll receive: ₩${sellerReceives.toLocaleString()}\n`;
    message += `Instant Sale: ${instantSale ? 'Yes' : 'No'}\n`;
    message += `Negotiable: ${negotiable ? 'Yes' : 'No'}\n\n`;
    message += `Your NFT will appear in the marketplace shortly.`;
    
    showSuccessPopup(message);
    closeSellModal();
}

// Simulate someone buying your listed NFT
function simulateSale(listingId) {
    const listing = userStorage.listedNFTs.find(l => l.id === listingId);
    if (!listing) return;
    
    const platformFee = Math.round(listing.price * 0.02);
    const sellerReceives = listing.price - platformFee;
    
    // Add money to balance
    userStorage.balance += sellerReceives;
    
    // Remove from listings
    userStorage.listedNFTs = userStorage.listedNFTs.filter(l => l.id !== listingId);
    
    // Add transaction
    userStorage.transactionHistory.push({
        type: 'sell',
        nftId: listing.nftId,
        amount: sellerReceives,
        date: new Date().toISOString(),
        description: `Sold ${listing.nft.name}`
    });
    
    saveUserStorage();
    updateUI();
    
    showSuccessPopup(`🎉 Your NFT has been sold!\n\nSold: ${listing.nft.name}\nSale Price: ₩${listing.price.toLocaleString()}\nYou received: ₩${sellerReceives.toLocaleString()}\n\nFunds have been added to your wallet!`);
}

// Price input event listener
document.addEventListener('input', function(e) {
    if (e.target.id === 'sell-price') {
        // Remove selection from price option buttons
        document.querySelectorAll('.price-option').forEach(btn => {
            btn.classList.remove('selected');
        });
        updateSellFees();
    }
});


function showMyNFTs() {
    let message = `📱 My NFT Collection (${userStorage.ownedNFTs.length})\n\n`;

    if (userStorage.ownedNFTs.length === 0) {
        message += 'No NFTs owned. Try minting or buying one!\n\n';
    } else {
        userStorage.ownedNFTs.forEach((nft, index) => {
            message += `${index + 1}. ${nft.name}\n`;
            message += `   ID: ${nft.id}\n`;
            message += `   Remaining: ${nft.remaining}\n`;
            message += `   Escrowed: ₩${nft.escrowed.toLocaleString()}\n`;
            message += `   Expires: ${nft.expires}\n\n`;
        });
    }
    
    if (userStorage.listedNFTs.length > 0) {
        message += `🏪 Listed for Sale (${userStorage.listedNFTs.length})\n\n`;
        userStorage.listedNFTs.forEach((listing, index) => {
            message += `${index + 1}. ${listing.nft.name}\n`;
            message += `   Price: ₩${listing.price.toLocaleString()}\n`;
            message += `   Listed: ${new Date(listing.listedDate).toLocaleDateString()}\n\n`;
        });
    }
    
    alert(message);
}

function showTransactionHistory() {
    let message = `📊 Transaction History (${userStorage.transactionHistory.length})\n\n`;

    if (userStorage.transactionHistory.length === 0) {
        message += 'No transactions yet.';
    } else {
        userStorage.transactionHistory.forEach((tx, index) => {
            const date = new Date(tx.timestamp).toLocaleDateString();
            const type = tx.type.toUpperCase();
            const amount = tx.amount ? `₩${tx.amount.toLocaleString()}` : '';
            
            message += `${type} - ${date}\n`;
            message += `${tx.description}\n`;
            if (amount) message += `Amount: ${amount}\n`;
            message += `\n`;
        });
    }
    
    alert(message);
}

function resetDemo() {
    const confirmMessage = `🔄 Reset Demo Data\n\nThis will:\n• Clear all your NFTs\n• Reset wallet to ₩125,000\n• Clear transaction history\n• Remove all marketplace listings\n• Restore 1 sample NFT\n\nAre you sure you want to continue?`;
    
    showConfirmPopup('Reset Demo Data', confirmMessage, () => {
        // Reset to initial demo state
        userStorage = {
            balance: 125000,
            ownedNFTs: [{
                id: 'GYM001234',
                name: 'FitZone Downtown - Premium Pass',
                gym: 'FitZone Downtown',
                location: 'Downtown',
                duration: '12 months',
                remaining: '8 months',
                expires: 'Dec 31, 2024',
                escrowed: 960000,
                originalPrice: 1440000,
                progress: 67,
                purchaseDate: '2024-04-01',
                transferable: true,
                refundable: true,
                insured: true
            }],
            transactionHistory: [],
            listedNFTs: []
        };
        
        // Clear any selected NFT IDs
        window.selectedNFTForTransfer = null;
        window.selectedNFTForSell = null;
        
        // Close any open modals
        document.querySelectorAll('.modal').forEach(modal => {
            if (modal.id !== 'login-screen') {
                modal.remove();
            }
        });
        
        // Save and update UI
        saveUserStorage();
        updateUI();
        
        // Show success message
        setTimeout(() => {
            showSuccessPopup('✅ Demo Reset Complete!\n\n• Wallet: ₩125,000\n• NFTs: 1 sample NFT restored\n• History: Cleared\n• Ready for new demo!');
        }, 100);
    });
}


// Custom Popup System
function showCustomPopup(title, message, type = 'info', showCancel = false, onConfirm = null, onCancel = null) {
    const popup = document.getElementById('custom-popup');
    const popupTitle = document.getElementById('popup-title');
    const popupMessage = document.getElementById('popup-message');
    const confirmBtn = document.getElementById('popup-confirm-btn');
    const cancelBtn = document.getElementById('popup-cancel-btn');
    
    // Set content
    popupTitle.textContent = title;
    popupMessage.textContent = message;
    
    // Show/hide cancel button
    cancelBtn.style.display = showCancel ? 'inline-block' : 'none';
    
    // Set button actions
    if (onConfirm) {
        confirmBtn.onclick = () => {
            closeCustomPopup();
            onConfirm();
        };
    } else {
        confirmBtn.onclick = closeCustomPopup;
    }
    
    if (onCancel) {
        cancelBtn.onclick = () => {
            closeCustomPopup();
            onCancel();
        };
    } else {
        cancelBtn.onclick = closeCustomPopup;
    }
    
    // Show popup
    popup.classList.add('active');
}

function closeCustomPopup() {
    const popup = document.getElementById('custom-popup');
    popup.classList.remove('active');
}

// Replace all alert() calls with custom popup
function showSuccessPopup(message) {
    showCustomPopup('Success! 🎉', message, 'success');
}

function showErrorPopup(message) {
    showCustomPopup('Error! ❌', message, 'error');
}

function showInfoPopup(message) {
    showCustomPopup('Information ℹ️', message, 'info');
}

function showConfirmPopup(title, message, onConfirm, onCancel = null) {
    showCustomPopup(title, message, 'confirm', true, onConfirm, onCancel);
}

// Mint NFT Functions
let selectedMintOption = null;

function showMintModal(gymName, gymLocation, tier = 'premium', price = 480000, duration = '6 months') {
    // Update gym info in modal
    document.getElementById('mint-gym-name').textContent = gymName;
    document.getElementById('mint-gym-location').textContent = gymLocation;
    
    // Set the selected tier
    selectedMintOption = { type: tier, price, duration };
    
    // Update the display with selected tier
    updateMintDisplay();
    
    // Update balance
    updateMintModalBalance();
    
    // Show modal
    document.getElementById('mint-modal').classList.add('active');
}

function closeMintModal() {
    document.getElementById('mint-modal').classList.remove('active');
    resetMintModal();
}

function updateMintDisplay() {
    if (!selectedMintOption) return;
    
    const { type, price, duration } = selectedMintOption;
    
    // Update membership display
    document.getElementById('display-membership-type').textContent = getMembershipDisplayName(type);
    document.getElementById('display-price').textContent = getMembershipDisplayPrice(type, price);
    
    // Update features display
    const featuresContainer = document.getElementById('display-features');
    featuresContainer.innerHTML = getMembershipFeatures(type, duration);
    
    // Show the display
    document.getElementById('selected-membership-display').style.display = 'block';
    
    // Update summary and transaction details
    updateMintSummary();
    
    // Enable confirm button
    const confirmBtn = document.getElementById('confirm-mint-btn');
    confirmBtn.disabled = false;
    confirmBtn.textContent = 'Confirm Mint';
}

function getMembershipDisplayName(type) {
    const names = {
        'basic': 'Basic Monthly',
        'premium': 'Premium 6-Month',
        'annual': 'Annual VIP'
    };
    return names[type] || type;
}

function getMembershipDisplayPrice(type, price) {
    const prices = {
        'basic': `₩${price.toLocaleString()}/month`,
        'premium': `₩${price.toLocaleString()} <small>(₩${Math.round(price/6).toLocaleString()}/month)</small>`,
        'annual': `₩${price.toLocaleString()} <small>(₩${Math.round(price/12).toLocaleString()}/month)</small>`
    };
    return prices[type] || `₩${price.toLocaleString()}`;
}

function getMembershipFeatures(type, duration) {
    const features = {
        'basic': [
            `<p><i class="fas fa-calendar"></i> ${duration} duration</p>`,
            `<p><i class="fas fa-undo"></i> 7-day refund policy</p>`,
            `<p><i class="fas fa-shield-alt"></i> Basic insurance</p>`,
            `<p><i class="fas fa-exchange-alt"></i> Transferable</p>`
        ],
        'premium': [
            `<p><i class="fas fa-calendar"></i> ${duration} duration</p>`,
            `<p><i class="fas fa-undo"></i> 30-day refund policy</p>`,
            `<p><i class="fas fa-shield-alt"></i> Full insurance</p>`,
            `<p><i class="fas fa-exchange-alt"></i> Transferable</p>`,
            `<p><i class="fas fa-gift"></i> Free PT session</p>`
        ],
        'annual': [
            `<p><i class="fas fa-calendar"></i> ${duration} duration</p>`,
            `<p><i class="fas fa-undo"></i> 60-day refund policy</p>`,
            `<p><i class="fas fa-shield-alt"></i> Premium insurance</p>`,
            `<p><i class="fas fa-exchange-alt"></i> Transferable</p>`,
            `<p><i class="fas fa-hot-tub"></i> Unlimited PT + Sauna</p>`
        ]
    };
    
    return features[type]?.join('') || '';
}

function resetMintModal() {
    // Clear selection
    selectedMintOption = null;
    
    // Hide display
    document.getElementById('selected-membership-display').style.display = 'none';
    
    // Reset button
    const confirmBtn = document.getElementById('confirm-mint-btn');
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Select Membership Type';
    
    // Clear summary fields
    document.getElementById('summary-type').textContent = '-';
    document.getElementById('summary-duration').textContent = '-';
    document.getElementById('summary-price').textContent = '-';
    document.getElementById('summary-escrowed').textContent = '-';
    
    // Clear transaction summary
    document.getElementById('mint-summary-price').textContent = '-';
    document.getElementById('mint-summary-fee').textContent = '-';
    document.getElementById('mint-summary-total').textContent = '-';
}



function updateMintSummary() {
    if (!selectedMintOption) return;
    
    const { type, price, duration } = selectedMintOption;
    const escrowed = Math.round(price * 0.8); // 80% escrowed
    const fee = Math.round(price * 0.02); // 2% platform fee
    const total = price + fee;
    
    // Update selected membership summary
    document.getElementById('summary-type').textContent = type.charAt(0).toUpperCase() + type.slice(1);
    document.getElementById('summary-duration').textContent = duration;
    document.getElementById('summary-price').textContent = `₩${price.toLocaleString()}`;
    document.getElementById('summary-escrowed').textContent = `₩${escrowed.toLocaleString()}`;
    
    // Update transaction summary
    document.getElementById('mint-summary-price').textContent = `₩${price.toLocaleString()}`;
    document.getElementById('mint-summary-fee').textContent = `₩${fee.toLocaleString()}`;
    document.getElementById('mint-summary-total').textContent = `₩${total.toLocaleString()}`;
    
    // Show summary
    document.getElementById('selected-membership-summary').style.display = 'block';
}

function updateMintModalBalance() {
    const balanceElement = document.querySelector('.balance-amount-mint');
    if (balanceElement) {
        balanceElement.textContent = `₩${userStorage.balance.toLocaleString()}`;
    }
}

function confirmMint() {
    if (!selectedMintOption) {
        showErrorPopup('Please select a membership type first');
        return;
    }
    
    const { type, price, duration } = selectedMintOption;
    const fee = Math.round(price * 0.02);
    const total = price + fee;
    
    // Check balance
    if (total > userStorage.balance) {
        showErrorPopup('Insufficient balance. Please deposit more KRW or choose "Deposit & Mint" option.');
        return;
    }
    
    // Get gym name from modal
    const gymName = document.getElementById('mint-gym-name').textContent;
    
    // Mint the NFT
    mintNFT(gymName, type, price, duration);
    
    // Close modal
    closeMintModal();
}

// Update existing mintNFT function to use custom popup
function mintNFT(gymName, membershipType, price, duration) {
    const priceNum = parseInt(price);
    
    if (userStorage.balance < priceNum) {
        showErrorPopup('Insufficient balance. Please deposit more KRW first.');
        return;
    }
    
    // Deduct balance
    userStorage.balance -= priceNum;
    
    // Create new NFT
    const newNFT = {
        id: 'GYM' + Date.now(),
        name: `${gymName} - ${membershipType.charAt(0).toUpperCase() + membershipType.slice(1)} Pass`,
        gym: gymName,
        location: getGymLocation(gymName),
        duration: duration,
        remaining: duration,
        expires: getExpiryDate(duration),
        escrowed: Math.round(priceNum * 0.8), // 80% escrowed
        originalPrice: priceNum,
        progress: 100,
        purchaseDate: new Date().toISOString().split('T')[0],
        transferable: true,
        refundable: true,
        insured: true
    };
    
    userStorage.ownedNFTs.push(newNFT);
    
    // Add transaction
    userStorage.transactionHistory.push({
        type: 'mint',
        nftId: newNFT.id,
        amount: priceNum,
        date: new Date().toISOString(),
        description: `Minted ${newNFT.name}`
    });
    
    saveUserStorage();
    updateUI();
    
    showSuccessPopup(`🎉 NFT Minted Successfully!\n\nYou now own: ${newNFT.name}\nNFT ID: ${newNFT.id}\nEscrowed: ₩${newNFT.escrowed.toLocaleString()}\n\nThe NFT has been added to your wallet!`);
}

console.log('GymPass NFT App initialized with storage system');
