// Multi-tier backup service: Local download, Firebase snapshot, and Google Drive upload

export const generateBackupPayload = (assets, sectors, cautelas) => {
  const timestamp = new Date().toISOString();
  return {
    version: '1.0',
    timestamp,
    dataGeracao: new Date().toLocaleString('pt-BR'),
    totalItens: assets.length,
    totalSetores: sectors.length,
    totalCautelas: cautelas.length,
    sectors,
    assets,
    cautelas
  };
};

// 1. Download Local JSON File
export const downloadLocalBackupFile = (backupPayload, customFileName = null) => {
  const jsonStr = JSON.stringify(backupPayload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const fileName = customFileName || `BACKUP_PATRIMONIO_${dateStr}.json`;

  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return fileName;
};

// 2. Save Snapshot to Firebase Firestore
export const saveSnapshotToFirebase = async (backupPayload) => {
  try {
    const { initFirebase } = await import('./firebase');
    const { isConfigured, db } = initFirebase();

    if (isConfigured && db) {
      const { doc, setDoc } = await import('firebase/firestore');
      const backupId = `backup_${Date.now()}`;
      await setDoc(doc(db, 'backups_snapshots', backupId), backupPayload);
      return { success: true, backupId };
    }
    return { success: false, reason: 'Firebase não conectado (modo local)' };
  } catch (error) {
    console.error('Firebase snapshot backup error:', error);
    return { success: false, error: error.message };
  }
};

// 3. Upload Backup to Google Drive using Google Identity Services / Drive API
export const uploadBackupToGoogleDrive = async (backupPayload, accessToken) => {
  try {
    const jsonContent = JSON.stringify(backupPayload, null, 2);
    const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const fileName = `BACKUP_PATRIMONIO_ORGAO_${dateStr}.json`;

    const metadata = {
      name: fileName,
      mimeType: 'application/json',
      description: `Backup completo do sistema CargaPatrimonio gerado em ${new Date().toLocaleString('pt-BR')}`
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', new Blob([jsonContent], { type: 'application/json' }));

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      body: form
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || 'Falha ao comunicar com o Google Drive');
    }

    const data = await response.json();
    return { success: true, fileId: data.id, fileName };
  } catch (error) {
    console.error('Google Drive backup error:', error);
    return { success: false, error: error.message };
  }
};
