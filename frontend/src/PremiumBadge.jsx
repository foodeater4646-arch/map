import './PremiumBadge.css';

/**
 * PremiumBadge — Reusable lock overlay for premium-gated features.
 * Shows a lock icon and a link to the Patreon page.
 */
export default function PremiumBadge({ feature, compact }) {
    return (
        <div className={`premium-badge-overlay ${compact ? 'compact' : ''}`}>
            <span className="lock-icon">🔒</span>
            {!compact && <span className="lock-label">{feature || 'Premium Feature'}</span>}
            <a
                href="https://www.patreon.com/c/mapforge936/membership"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-premium unlock-btn"
            >
                Unlock via Patreon
            </a>
        </div>
    );
}
