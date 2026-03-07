/**
 * ShopPanel.jsx — Dynamic Shop / Economy panel
 *
 * Shows all shops / markets / blacksmiths in the settlement
 * with their dynamically priced inventories.
 */

import { useState } from 'react';
import './ShopPanel.css';

const RARITY_COLORS = {
    common: '#9ca3af',
    uncommon: '#22c55e',
    rare: '#3b82f6',
};

export default function ShopPanel({ settlement, onClose }) {
    const [selectedShop, setSelectedShop] = useState(null);
    const shops = settlement.buildings.filter(b => b.inventory && b.inventory.length > 0);

    return (
        <div className="shop-panel slide-panel">
            <div className="shop-panel-header">
                <h2>🪙 Economy &amp; Shops</h2>
                <button className="close-btn" onClick={onClose}>✕</button>
            </div>

            <div className="shop-panel-body">
                {/* Shop List */}
                <div className="shop-list">
                    {shops.length === 0 && <p className="empty-state">No shops in this settlement.</p>}
                    {shops.map(shop => (
                        <div
                            key={shop.id}
                            className={`shop-card ${selectedShop?.id === shop.id ? 'active' : ''}`}
                            onClick={() => setSelectedShop(shop)}
                        >
                            <span className="shop-icon">{shop.icon}</span>
                            <div className="shop-info">
                                <span className="shop-name">{shop.name}</span>
                                <span className="shop-type">{shop.type} · {shop.inventory.length} items</span>
                            </div>
                            <span className="shop-status">{shop.isOpen ? '🟢' : '🔴'}</span>
                        </div>
                    ))}
                </div>

                {/* Inventory Detail */}
                {selectedShop && (
                    <div className="shop-inventory">
                        <h3>{selectedShop.icon} {selectedShop.name}</h3>
                        <p className="shop-inventory-subtitle">{selectedShop.isOpen ? 'Open for business' : 'Currently closed'}</p>

                        <table className="inventory-table">
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Price (gp)</th>
                                    <th>Stock</th>
                                    <th>Supply</th>
                                    <th>Demand</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedShop.inventory.map((item, i) => (
                                    <tr key={i} className={`rarity-${item.rarity}`}>
                                        <td>
                                            <span className="item-name">{item.name}</span>
                                            <span className="item-rarity" style={{ color: RARITY_COLORS[item.rarity] }}>
                                                {item.rarity}
                                            </span>
                                        </td>
                                        <td className="price-cell">
                                            <span className="gold-icon">🪙</span> {item.currentPrice}
                                        </td>
                                        <td>
                                            <span className={`stock-badge ${item.stock <= 2 ? 'low' : item.stock >= 10 ? 'high' : 'normal'}`}>
                                                {item.stock}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`econ-tag supply-${item.supply.toLowerCase()}`}>
                                                {item.supply === 'Low' ? '📉' : item.supply === 'High' ? '📈' : '➡️'} {item.supply}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`econ-tag demand-${item.demand.toLowerCase()}`}>
                                                {item.demand === 'High' ? '🔥' : item.demand === 'Low' ? '❄️' : '⚖️'} {item.demand}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {!selectedShop && shops.length > 0 && (
                    <div className="shop-inventory empty-inventory">
                        <p className="empty-state">← Select a shop to view its inventory</p>
                    </div>
                )}
            </div>
        </div>
    );
}
