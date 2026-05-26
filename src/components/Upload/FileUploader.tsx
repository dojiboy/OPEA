import React, { useCallback, useState } from 'react';
import { useReportStore, useUIStore } from '../../store';
import { parseMT5Report, categorizeFile } from '../../utils/parsers/mt5ReportParser';
import { UploadedFile } from '../../types';

const FileUploader: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const { addUploadedFile, addReport } = useReportStore();
  const { setLoading, addToast } = useUIStore();

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    setLoading(true, 'Parsing files...');

    for (const file of fileArray) {
      const uploadedFile: UploadedFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.name.split('.').pop()?.toLowerCase() as 'csv' | 'xlsx' | 'htm' || 'csv',
        category: categorizeFile(file.name),
        size: file.size,
        uploadDate: new Date(),
        data: [],
        status: 'pending',
      };

      try {
        const report = await parseMT5Report(file);
        uploadedFile.status = 'parsed';
        uploadedFile.data = report.tradesList;
        
        addUploadedFile(uploadedFile);
        addReport(report);
        
        addToast({
          type: 'success',
          message: `Successfully parsed: ${file.name} (${report.tradesList.length} trades)`,
        });
      } catch (error) {
        uploadedFile.status = 'error';
        uploadedFile.errorMessage = error instanceof Error ? error.message : 'Unknown error';
        addUploadedFile(uploadedFile);
        
        addToast({
          type: 'error',
          message: `Failed to parse: ${file.name}`,
        });
      }
    }

    setLoading(false);
  }, [addUploadedFile, addReport, setLoading, addToast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files?.length) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      handleFiles(e.target.files);
    }
    e.target.value = '';
  }, [handleFiles]);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Upload Backtest Reports</h2>
      <p style={styles.subtitle}>
        Drag & drop MT5 report files (.csv, .xlsx, .htm) or click to browse
      </p>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        style={{
          ...styles.dropzone,
          ...(isDragging ? styles.dropzoneActive : {}),
        }}
      >
        <input
          id="file-input"
          type="file"
          multiple
          accept=".csv,.xlsx,.xls,.htm,.html"
          onChange={handleFileInput}
          style={styles.fileInput}
          aria-label="File upload input"
        />
        
        <div style={styles.dropzoneContent}>
          <span style={styles.icon}>📁</span>
          <p style={styles.dropText}>
            Drop files here or <strong>click to browse</strong>
          </p>
          <p style={styles.supportedFormats}>
            Supported: .csv, .xlsx, .htm (MT5 reports)
          </p>
        </div>
      </div>

      <div style={styles.features}>
        <div style={styles.feature}>
          <span style={styles.featureIcon}>⚡</span>
          <span>Instant parsing</span>
        </div>
        <div style={styles.feature}>
          <span style={styles.featureIcon}>📊</span>
          <span>Auto-categorization</span>
        </div>
        <div style={styles.feature}>
          <span style={styles.featureIcon}>💾</span>
          <span>Local storage</span>
        </div>
        <div style={styles.feature}>
          <span style={styles.featureIcon}>🔒</span>
          <span>Private & secure</span>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '24px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '16px',
    color: 'var(--text-secondary)',
    marginBottom: '32px',
  },
  dropzone: {
    border: '2px dashed var(--border-color)',
    borderRadius: '12px',
    padding: '60px 24px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    background: 'var(--bg-primary)',
    position: 'relative',
  },
  dropzoneActive: {
    borderColor: 'var(--primary)',
    background: 'rgba(37, 99, 235, 0.05)',
  },
  fileInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
    cursor: 'pointer',
  },
  dropzoneContent: {
    pointerEvents: 'none',
  },
  icon: {
    fontSize: '48px',
    display: 'block',
    marginBottom: '16px',
  },
  dropText: {
    fontSize: '18px',
    color: 'var(--text-primary)',
    margin: '0 0 8px 0',
  },
  supportedFormats: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    margin: 0,
  },
  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '16px',
    marginTop: '40px',
  },
  feature: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '16px',
    background: 'var(--bg-primary)',
    borderRadius: '8px',
    fontSize: '14px',
    color: 'var(--text-secondary)',
  },
  featureIcon: {
    fontSize: '20px',
  },
};

export default FileUploader;
