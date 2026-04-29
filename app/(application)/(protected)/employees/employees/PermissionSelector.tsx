'use client';

/**
 * PermissionSelector
 *
 * Human-readable, non-developer-friendly permission selection UI.
 * Works for both StaffManagement (name-based) and EmployeeCreateForm (id-based)
 * via the generic `isChecked` / `onToggle` callbacks.
 */

import { CATEGORY_ORDER, getActionLabel, getCategoryColors, getCategoryLabel, getSidebarMenus } from '@/lib/permissionConfig';
import { CheckCircle2, ChevronDown, ChevronUp, LayoutGrid, Menu, Shield } from 'lucide-react';
import { useMemo, useState } from 'react';

export interface Permission {
    id: number;
    name: string;
}

interface PermissionSelectorProps {
    allPermissions: Permission[];
    /** Return true if the given permission is currently selected */
    isChecked: (permission: Permission) => boolean;
    /** Called when user clicks a single permission row */
    onToggle: (permission: Permission) => void;
    /** Called when user toggles an entire category */
    onCategoryToggle: (category: string, permissions: Permission[]) => void;
    /** Called when user clicks "Select All" / "Deselect All" at the top */
    onSelectAll: () => void;
    selectAll: boolean;
    selectedCount: number;
    loading?: boolean;
}

// ─── Toggle Switch ────────────────────────────────────────────────────────────
function ToggleSwitch({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={onChange}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 ${
                checked ? 'bg-emerald-500' : 'bg-gray-200'
            }`}
        >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </button>
    );
}

// ─── Sidebar Menu Badge ───────────────────────────────────────────────────────
function SidebarBadge({ label, badgeClass }: { label: string; badgeClass: string }) {
    return (
        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${badgeClass}`}>
            <Menu className="h-2.5 w-2.5" />
            {label}
        </span>
    );
}

// ─── Permission Row ───────────────────────────────────────────────────────────
function PermissionRow({ permission, checked, onToggle, disabled, badgeClass }: { permission: Permission; checked: boolean; onToggle: () => void; disabled: boolean; badgeClass: string }) {
    const label = getActionLabel(permission.name);
    const menus = getSidebarMenus(permission.name);

    return (
        <div className={`rounded-lg border p-3 transition-all duration-150 ${checked ? 'border-emerald-200 bg-emerald-50/60' : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'}`}>
            <div className="flex items-start gap-3">
                <ToggleSwitch checked={checked} onChange={onToggle} disabled={disabled} />
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-sm font-semibold ${checked ? 'text-emerald-800' : 'text-gray-700'}`}>{label}</span>
                        {checked && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />}
                    </div>

                    {/* Sidebar menu badges */}
                    {menus.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                            {menus.map((menu) => (
                                <SidebarBadge key={menu} label={menu} badgeClass={badgeClass} />
                            ))}
                        </div>
                    )}

                    {/* No sidebar access note */}
                    {menus.length === 0 && <p className="mt-1 text-[10px] italic text-gray-400">No sidebar menu — background action only</p>}
                </div>

                {/* ON / OFF label */}
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide ${checked ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'}`}>
                    {checked ? 'ON' : 'OFF'}
                </span>
            </div>
        </div>
    );
}

// ─── Category Card ────────────────────────────────────────────────────────────
function CategoryCard({
    category,
    permissions,
    isChecked,
    onToggle,
    onCategoryToggle,
    selectAll,
}: {
    category: string;
    permissions: Permission[];
    isChecked: (p: Permission) => boolean;
    onToggle: (p: Permission) => void;
    onCategoryToggle: (cat: string, perms: Permission[]) => void;
    selectAll: boolean;
}) {
    const [expanded, setExpanded] = useState(true);
    const colors = getCategoryColors(category);
    const label = getCategoryLabel(category);

    const checkedCount = permissions.filter((p) => selectAll || isChecked(p)).length;
    const allSelected = checkedCount === permissions.length;
    const someSelected = checkedCount > 0 && !allSelected;

    return (
        <div className={`overflow-hidden rounded-xl border-2 ${colors.border} bg-white shadow-sm`}>
            {/* Card Header */}
            <div className={`${colors.bg} px-4 py-3`}>
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-white/70 shadow-sm`}>
                            <Shield className={`h-4 w-4 ${colors.icon}`} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-800">{label}</h3>
                            <p className="text-[10px] text-gray-500">
                                {checkedCount} of {permissions.length} enabled
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Progress pill */}
                        <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                allSelected ? 'bg-emerald-100 text-emerald-700' : someSelected ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'
                            }`}
                        >
                            {allSelected ? 'All ON' : someSelected ? 'Partial' : 'All OFF'}
                        </span>

                        {/* Category toggle button */}
                        {!selectAll && (
                            <button
                                type="button"
                                onClick={() => onCategoryToggle(category, permissions)}
                                className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                                    allSelected ? 'border-red-200 bg-white text-red-600 hover:bg-red-50' : 'border-blue-200 bg-white text-blue-600 hover:bg-blue-50'
                                }`}
                            >
                                {allSelected ? 'Turn All OFF' : 'Turn All ON'}
                            </button>
                        )}

                        {/* Expand / collapse */}
                        <button
                            type="button"
                            onClick={() => setExpanded((v) => !v)}
                            className="rounded-lg p-1 text-gray-400 hover:bg-white/60 hover:text-gray-600"
                            aria-label={expanded ? 'Collapse' : 'Expand'}
                        >
                            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200/70">
                    <div
                        className={`h-full rounded-full transition-all duration-300 ${allSelected ? 'bg-emerald-500' : someSelected ? 'bg-amber-400' : 'bg-gray-300'}`}
                        style={{ width: `${(checkedCount / permissions.length) * 100}%` }}
                    />
                </div>
            </div>

            {/* Permission Rows */}
            {expanded && (
                <div className="space-y-2 p-3">
                    {permissions.map((permission) => (
                        <PermissionRow
                            key={permission.id}
                            permission={permission}
                            checked={selectAll || isChecked(permission)}
                            onToggle={() => onToggle(permission)}
                            disabled={selectAll}
                            badgeClass={colors.badge}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PermissionSelector({ allPermissions, isChecked, onToggle, onCategoryToggle, onSelectAll, selectAll, selectedCount, loading }: PermissionSelectorProps) {
    // Group and sort permissions by category
    const groupedPermissions = useMemo(() => {
        const groups: Record<string, Permission[]> = {};

        allPermissions.forEach((permission) => {
            const category = permission.name.split('.')[0] || 'general';
            if (!groups[category]) groups[category] = [];
            groups[category].push(permission);
        });

        // Sort by preferred order, then alphabetically for unknowns
        const sorted: Record<string, Permission[]> = {};
        CATEGORY_ORDER.forEach((cat) => {
            if (groups[cat]) sorted[cat] = groups[cat];
        });
        Object.keys(groups).forEach((cat) => {
            if (!sorted[cat]) sorted[cat] = groups[cat];
        });

        return sorted;
    }, [allPermissions]);

    const totalPermissions = allPermissions.length;
    const enabledCount = selectAll ? totalPermissions : selectedCount;

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
                    <p className="mt-3 text-sm text-gray-500">Loading permissions...</p>
                </div>
            </div>
        );
    }

    if (totalPermissions === 0) {
        return (
            <div className="rounded-xl border-2 border-dashed border-gray-200 py-12 text-center text-gray-400">
                <Shield className="mx-auto mb-2 h-10 w-10 opacity-30" />
                <p className="text-sm">No permissions available.</p>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            {/* Global Header Bar */}
            <div className="flex flex-col gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-sm">
                        <LayoutGrid className="h-4 w-4 text-white" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-blue-900">
                            {enabledCount} / {totalPermissions} permissions enabled
                        </p>
                        <p className="text-xs text-blue-600">Toggle individual actions or use the Turn All ON / OFF button per module</p>
                    </div>
                </div>

                {/* Select All toggle */}
                <label className="flex cursor-pointer select-none items-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 transition hover:bg-blue-50">
                    <ToggleSwitch checked={selectAll} onChange={onSelectAll} />
                    <span className={`text-xs font-bold ${selectAll ? 'text-emerald-700' : 'text-gray-600'}`}>{selectAll ? 'All Permissions ON' : 'Enable All Permissions'}</span>
                </label>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                    <span className="inline-block h-3 w-5 rounded-full bg-emerald-500" />
                    Permission is <strong className="text-emerald-700">ON</strong> — employee can do this
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="inline-block h-3 w-5 rounded-full bg-gray-200" />
                    Permission is <strong className="text-gray-600">OFF</strong> — access denied
                </span>
                <span className="flex items-center gap-1.5">
                    <Menu className="h-3 w-3 text-blue-500" />
                    Badge = sidebar menu item that becomes visible
                </span>
            </div>

            {/* Category Grid */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {Object.entries(groupedPermissions).map(([category, permissions]) => (
                    <CategoryCard key={category} category={category} permissions={permissions} isChecked={isChecked} onToggle={onToggle} onCategoryToggle={onCategoryToggle} selectAll={selectAll} />
                ))}
            </div>
        </div>
    );
}
