import React, { useState } from 'react';
import { Search, Folder, ChevronRight, Loader2 } from 'lucide-react';
import { Company } from '../types';

interface CompanySidebarProps {
  companies: Company[];
  selectedCompany: Company | null;
  onSelectCompany: (company: Company) => void;
  loading: boolean;
}

export const CompanySidebar: React.FC<CompanySidebarProps> = ({ 
  companies, 
  selectedCompany, 
  onSelectCompany, 
  loading 
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-64 h-full border-r border-dark-700 bg-dark-800 flex flex-col shrink-0">
      <div className="p-3 border-b border-dark-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
          <input 
            type="text" 
            placeholder="Search companies..."
            className="w-full bg-dark-900 border border-dark-700 rounded-md py-1.5 pl-9 pr-3 text-sm text-slate-200 focus:outline-none focus:border-primary-500 transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-500">
            <Loader2 className="animate-spin mb-2" size={24} />
            <span className="text-xs">Loading companies...</span>
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="p-4 text-center text-slate-500 text-sm">
            No companies found.
          </div>
        ) : (
          <div className="flex flex-col p-2 space-y-0.5">
            {filteredCompanies.map((company) => (
              <button
                key={company.path}
                onClick={() => onSelectCompany(company)}
                className={`flex items-center justify-between w-full px-3 py-2 text-sm rounded-md transition-all group ${
                  selectedCompany?.path === company.path
                    ? 'bg-primary-600/10 text-primary-500 border border-primary-600/20'
                    : 'text-slate-400 hover:bg-dark-700 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Folder size={14} className={selectedCompany?.path === company.path ? 'fill-primary-500/20' : ''} />
                  <span className="truncate">{company.name}</span>
                </div>
                {selectedCompany?.path === company.path && <ChevronRight size={14} />}
              </button>
            ))}
          </div>
        )}
      </div>
      
      <div className="p-3 border-t border-dark-700 text-xs text-slate-600 text-center">
        {filteredCompanies.length} Companies
      </div>
    </div>
  );
};
