import { useState } from 'react';
import AppPicker from './AppPicker';
import { ResEditor } from './ResEditor';

export default function ResBuilder() {
  const [view, setView] = useState<'apps' | 'edit'>('apps');
  return view === 'apps' ? (
    <AppPicker onChangeViewToEdit={() => setView('edit')} />
  ) : (
    <ResEditor onChangeViewToApps={() => setView('apps')} />
  );
}
