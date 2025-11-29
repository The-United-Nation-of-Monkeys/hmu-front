import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useTranslation } from 'react-i18next'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  accept?: Record<string, string[]>
  maxSize?: number
  disabled?: boolean
}

export function FileUpload({
  onFileSelect,
  accept = { 'image/*': ['.png', '.jpg', '.jpeg', '.pdf'] },
  maxSize = 10 * 1024 * 1024, // 10MB
  disabled = false,
}: FileUploadProps) {
  const { t } = useTranslation()

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0])
      }
    },
    [onFileSelect]
  )

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } =
    useDropzone({
      onDrop,
      accept,
      maxSize,
      disabled,
      multiple: false,
    })

  return (
    <Card className="p-6">
      <div
        {...getRootProps()}
        className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 cursor-pointer transition-colors ${
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <Upload className="h-12 w-12 mb-4 text-muted-foreground" />
        <p className="text-sm text-center text-muted-foreground mb-2">
          {isDragActive
            ? t('selectFile')
            : t('dragDropFile')}
        </p>
        {acceptedFiles.length > 0 && (
          <div className="mt-4 flex items-center gap-2">
            <File className="h-4 w-4" />
            <span className="text-sm">{acceptedFiles[0].name}</span>
          </div>
        )}
      </div>
    </Card>
  )
}

