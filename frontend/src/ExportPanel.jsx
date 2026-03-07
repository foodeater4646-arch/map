/**
 * ExportPanel.jsx — Export settlement data in various formats
 *
 * Supports: Map image, JSON, CSV (people/buildings), FoundryVTT, Roll20
 */

import './ExportPanel.css';

export default function ExportPanel({ settlement, imageUrl, onClose }) {
    // ── JSON Export ────────────────────────────────────────────
    const exportJSON = () => {
        const data = {
            ...settlement,
            exportedAt: new Date().toISOString(),
            version: '1.0',
        };
        downloadFile(
            JSON.stringify(data, null, 2),
            `${settlement.name.replace(/\s+/g, '_')}_settlement.json`,
            'application/json'
        );
    };

    // ── CSV Export (People) ────────────────────────────────────
    const exportPeopleCSV = () => {
        const headers = ['Name', 'Race', 'Gender', 'Age', 'Job', 'Status', 'Location', 'Traits', 'Goal'];
        const rows = settlement.npcs.map(npc => {
            const bld = settlement.buildings.find(b => b.id === npc.currentLocation?.buildingId);
            return [
                npc.name, npc.race, npc.gender, npc.age, npc.job, npc.status,
                bld ? `${bld.name} - ${npc.currentLocation.room}` : 'Unknown',
                npc.traits.join('; '),
                npc.goal,
            ];
        });
        const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
        downloadFile(csv, `${settlement.name.replace(/\s+/g, '_')}_people.csv`, 'text/csv');
    };

    // ── CSV Export (Buildings) ─────────────────────────────────
    const exportBuildingsCSV = () => {
        const headers = ['Name', 'Type', 'Open', 'Rooms', 'Occupant Count', 'Notes'];
        const rows = settlement.buildings.map(bld => {
            const occupants = settlement.npcs.filter(n => n.currentLocation?.buildingId === bld.id);
            return [
                bld.name, bld.type, bld.isOpen ? 'Yes' : 'No',
                bld.rooms.map(r => r.name).join('; '),
                occupants.length,
                bld.notes || '',
            ];
        });
        const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
        downloadFile(csv, `${settlement.name.replace(/\s+/g, '_')}_buildings.csv`, 'text/csv');
    };

    // ── FoundryVTT JSON Export ─────────────────────────────────
    const exportFoundryVTT = () => {
        const scene = {
            name: settlement.name,
            navigation: true,
            width: 3000,
            height: 3000,
            grid: { size: 50, type: 1 },
            tokens: settlement.npcs.map((npc, idx) => ({
                name: npc.name,
                x: 100 + (idx % 10) * 150,
                y: 100 + Math.floor(idx / 10) * 150,
                disposition: 0,
                actorData: {
                    name: npc.name,
                    type: 'npc',
                    system: {
                        abilities: Object.fromEntries(
                            Object.entries(npc.abilityScores).map(([k, v]) => [
                                k.toLowerCase().substring(0, 3),
                                { value: v.score }
                            ])
                        ),
                        details: {
                            race: npc.race,
                            biography: `${npc.job}. ${npc.traits.join(', ')}. Goal: ${npc.goal}.`,
                        }
                    }
                }
            })),
            notes: settlement.buildings.map((bld, idx) => ({
                text: `${bld.icon} ${bld.name} (${bld.type})`,
                x: 200 + (idx % 5) * 200,
                y: 200 + Math.floor(idx / 5) * 200,
            })),
            _exportFormat: 'FoundryVTT-Scene',
            _version: '1.0',
        };
        downloadFile(
            JSON.stringify(scene, null, 2),
            `${settlement.name.replace(/\s+/g, '_')}_foundry.json`,
            'application/json'
        );
    };

    // ── Roll20 Export ──────────────────────────────────────────
    const exportRoll20 = () => {
        const data = {
            schema_version: 3,
            type: 'character',
            character: settlement.npcs.map(npc => ({
                name: npc.name,
                bio: `<p><strong>${npc.race} ${npc.job}</strong></p><p>${npc.traits.join(', ')}</p><p>Goal: ${npc.goal}</p>`,
                attribs: [
                    { name: 'strength', current: npc.abilityScores.Strength.score },
                    { name: 'dexterity', current: npc.abilityScores.Dexterity.score },
                    { name: 'constitution', current: npc.abilityScores.Constitution.score },
                    { name: 'intelligence', current: npc.abilityScores.Intelligence.score },
                    { name: 'wisdom', current: npc.abilityScores.Wisdom.score },
                    { name: 'charisma', current: npc.abilityScores.Charisma.score },
                    { name: 'npc_type', current: npc.job },
                    { name: 'race', current: npc.race },
                ],
            })),
            _exportFormat: 'Roll20-Characters',
            _version: '1.0',
        };
        downloadFile(
            JSON.stringify(data, null, 2),
            `${settlement.name.replace(/\s+/g, '_')}_roll20.json`,
            'application/json'
        );
    };

    // ── Map Image Download ─────────────────────────────────────
    const downloadMapImage = () => {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `${settlement.name.replace(/\s+/g, '_')}_map.png`;
        link.click();
    };

    // ── Campaign Wiki Markdown ─────────────────────────────
    const exportCampaignWiki = () => {
        let md = `# ${settlement.name}\n\n`;
        md += `> **Size:** ${settlement.size} | `;
        md += `**Government:** ${settlement.settings?.govType || 'Unknown'} | `;
        md += `**Climate:** ${settlement.settings?.climate || 'Unknown'}\n\n`;
        md += `**Population:** ${settlement.npcs.length} residents · `;
        md += `**Buildings:** ${settlement.buildings.length} · `;
        md += `**Districts:** ${settlement.districts?.length || 0}\n\n`;
        md += `---\n\n`;

        // Districts
        if (settlement.districts && settlement.districts.length > 0) {
            md += `## Districts\n\n`;
            settlement.districts.forEach(d => {
                const dBuildings = settlement.buildings.filter(b => b.districtId === d.id);
                md += `### ${d.name}\n`;
                md += `${d.description}\n\n`;
                md += `**Buildings:** ${dBuildings.map(b => `${b.icon} ${b.name}`).join(', ') || 'None'}\n\n`;
            });
            md += `---\n\n`;
        }

        // Buildings
        md += `## Buildings\n\n`;
        settlement.buildings.forEach(bld => {
            const occupants = settlement.npcs.filter(n => n.currentLocation?.buildingId === bld.id);
            md += `### ${bld.icon} ${bld.name}\n`;
            md += `**Type:** ${bld.type} | **Status:** ${bld.isOpen ? 'Open' : 'Closed'}\n\n`;
            if (occupants.length > 0) {
                md += `| Occupant | Job | Status |\n`;
                md += `|----------|-----|--------|\n`;
                occupants.forEach(n => {
                    md += `| ${n.name} | ${n.job} | ${n.status} |\n`;
                });
                md += `\n`;
            }
            // Shop inventory
            if (bld.inventory && bld.inventory.length > 0) {
                md += `**Shop Inventory:**\n\n`;
                md += `| Item | Price (gp) | Stock | Rarity |\n`;
                md += `|------|-----------|-------|--------|\n`;
                bld.inventory.forEach(item => {
                    md += `| ${item.name} | ${item.currentPrice} | ${item.stock} | ${item.rarity} |\n`;
                });
                md += `\n`;
            }
            if (bld.notes) md += `> ${bld.notes}\n\n`;
        });
        md += `---\n\n`;

        // NPCs
        md += `## Notable People\n\n`;
        settlement.npcs.forEach(npc => {
            const bld = settlement.buildings.find(b => b.id === npc.currentLocation?.buildingId);
            md += `### ${npc.name}\n`;
            md += `**${npc.age}yo ${npc.gender} ${npc.race} ${npc.job}**\n\n`;
            md += `- **Personality:** ${npc.traits.join(', ')}\n`;
            md += `- **Goal:** ${npc.goal}\n`;
            md += `- **Location:** ${bld ? bld.name : 'Unknown'}\n`;
            if (npc.factionId) {
                const faction = settlement.factions?.find(f => f.id === npc.factionId);
                if (faction) md += `- **Faction:** ${faction.name} (${npc.factionRole})\n`;
            }
            if (npc.relationships && npc.relationships.length > 0) {
                md += `- **Relationships:** ${npc.relationships.map(r => {
                    const other = settlement.npcs.find(n => n.id === r.id);
                    return other ? `${other.name} (${r.type})` : '';
                }).filter(Boolean).join(', ')}\n`;
            }
            md += `\n`;
        });
        md += `---\n\n`;

        // Factions
        if (settlement.factions && settlement.factions.length > 0) {
            md += `## Factions\n\n`;
            settlement.factions.forEach(f => {
                md += `### ${f.name}\n`;
                md += `**Type:** ${f.type} | **Influence:** ${f.influence}%\n\n`;
                md += `${f.description}\n\n`;
                const members = settlement.npcs.filter(n => n.factionId === f.id);
                if (members.length > 0) {
                    md += `| Member | Role |\n`;
                    md += `|--------|------|\n`;
                    members.forEach(m => {
                        md += `| ${m.name} | ${m.factionRole} |\n`;
                    });
                    md += `\n`;
                }
            });
        }

        md += `---\n\n*Exported from TTRPG Map Forge on ${new Date().toLocaleDateString()}*\n`;

        downloadFile(
            md,
            `${settlement.name.replace(/\s+/g, '_')}_wiki.md`,
            'text/markdown'
        );
    };

    // ── Utility ────────────────────────────────────────────────
    function downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    }

    return (
        <div className="export-overlay" onClick={onClose}>
            <div className="export-panel" onClick={e => e.stopPropagation()}>
                <div className="panel-header">
                    <h2>📦 Export Settlement</h2>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="export-grid">
                    <button className="export-card" onClick={downloadMapImage}>
                        <span className="export-icon">🗺️</span>
                        <span className="export-label">Map Image</span>
                        <span className="export-desc">Download as PNG</span>
                    </button>

                    <button className="export-card" onClick={exportJSON}>
                        <span className="export-icon">📋</span>
                        <span className="export-label">Full Settlement</span>
                        <span className="export-desc">JSON (all data)</span>
                    </button>

                    <button className="export-card" onClick={exportPeopleCSV}>
                        <span className="export-icon">👥</span>
                        <span className="export-label">People</span>
                        <span className="export-desc">CSV spreadsheet</span>
                    </button>

                    <button className="export-card" onClick={exportBuildingsCSV}>
                        <span className="export-icon">🏛️</span>
                        <span className="export-label">Buildings</span>
                        <span className="export-desc">CSV spreadsheet</span>
                    </button>

                    <button className="export-card vtt" onClick={exportFoundryVTT}>
                        <span className="export-icon">🎲</span>
                        <span className="export-label">FoundryVTT</span>
                        <span className="export-desc">Scene + Tokens</span>
                    </button>

                    <button className="export-card vtt" onClick={exportRoll20}>
                        <span className="export-icon">🎯</span>
                        <span className="export-label">Roll20</span>
                        <span className="export-desc">Characters JSON</span>
                    </button>

                    <button className="export-card wiki" onClick={exportCampaignWiki}>
                        <span className="export-icon">📖</span>
                        <span className="export-label">Campaign Wiki</span>
                        <span className="export-desc">Full Markdown</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
