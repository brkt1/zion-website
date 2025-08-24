import { Tab } from '@headlessui/react';
import {
  CogIcon,
  DatabaseIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  TableIcon
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import DataManager from './database/DataManager';
import QueryExecutor from './database/QueryExecutor';
import RLSManager from './database/RLSManager';
import SchemaManager from './database/SchemaManager';
import TablesManager from './database/TablesManager';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function DatabaseManager() {
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const tabs = [
    { name: 'Tables', icon: TableIcon, component: TablesManager },
    { name: 'Data Operations', icon: DatabaseIcon, component: DataManager },
    { name: 'RLS Policies', icon: ShieldCheckIcon, component: RLSManager },
    { name: 'Schema', icon: DocumentTextIcon, component: SchemaManager },
    { name: 'Query Executor', icon: CogIcon, component: QueryExecutor },
  ];

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Full Database Control Panel
        </h2>
        <p className="text-sm text-gray-600">
          Manage tables, data, RLS policies, and execute custom queries with full administrative access.
        </p>
      </div>

      <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
        <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1 mb-6">
          {tabs.map((tab) => (
            <Tab
              key={tab.name}
              className={({ selected }) =>
                classNames(
                  'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                  'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                  selected
                    ? 'bg-white shadow text-blue-700'
                    : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                )
              }
            >
              <div className="flex items-center justify-center space-x-2">
                <tab.icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </div>
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-2">
          {tabs.map((tab, idx) => (
            <Tab.Panel
              key={idx}
              className={classNames(
                'rounded-xl bg-white p-3',
                'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'
              )}
            >
              <tab.component />
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>

      {isLoading && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>Processing...</span>
          </div>
        </div>
      )}
    </div>
  );
}
