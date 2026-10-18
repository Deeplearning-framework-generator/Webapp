import React, { useState } from 'react'
import { useBlocks } from '../hooks/useBlocks'
import BlocksHeader from '../components/blocks/BlocksHeader'
import BlocksFilterBar from '../components/blocks/BlocksFilterBar'
import BlockGrid from '../components/blocks/BlockGrid'
import DropPyZone from '../components/blocks/DropPyZone'
import Pagination from '../components/blocks/Pagination'
import UploadPyModal from '../components/blocks/UploadPyModal'
import { CheckCircle2 } from 'lucide-react'

/**
 * Blocks page, URL: "/blocks"
 * Clean page component delegating state management to useBlocks hook
 * and rendering modular UI components.
 */
export default function BlocksPage() {
  const {
    blocks,
    allBlocks,
    allFilteredCount,
    totalBlocksCount,
    selectedCategory,
    selectedModality,
    searchQuery,
    currentPage,
    totalPages,
    pageSize,
    categoryCounts,
    uploadModalOpen,
    notification,
    setUploadModalOpen,
    handleCategoryChange,
    handleModalityChange,
    handleSearchChange,
    setCurrentPage,
    addBlockFromPyFile,
    addDataset,
    showNotification
  } = useBlocks()

  const [pendingFile, setPendingFile] = useState(null)

  const handleOpenUploadModalWithFile = (file) => {
    if (!file) return
    const ext = file.name ? file.name.split('.').pop().toLowerCase() : ''
    
    // Dataset uploads require actual data files/zip/folders which will be handled in a dedicated flow
    if (['csv', 'json', 'zip', 'tar', 'gz', 'parquet', 'tsv'].includes(ext)) {
      showNotification('Dataset upload with data files/folders will be supported in a separate dataset flow.', 'info')
      return
    }

    if (ext !== 'py') {
      showNotification('Please upload a Python (.py) module file.', 'info')
      return
    }

    // For Python files, open the interactive configuration modal
    setPendingFile(file)
    setUploadModalOpen(true)
  }

  const handleModalConfirm = (codeText, fileName, fileObj, options) => {
    addBlockFromPyFile(fileObj || codeText, fileName, options)
  }

  const handleResetFilters = () => {
    handleCategoryChange('All')
    handleModalityChange('All')
    handleSearchChange('')
  }

  return (
    <div className="flex flex-col gap-3.5 max-w-[1240px] mx-auto w-full">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-3 shadow-lg text-xs font-medium animate-bounce">
          <CheckCircle2 className="size-4 text-emerald-400" />
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Header section with actions */}
      <BlocksHeader
        onOpenUploadModal={(file) => handleOpenUploadModalWithFile(file)}
        onAddDataset={addDataset}
      />

      {/* Filter Bar (Categories, Modality & Search) */}
      <BlocksFilterBar
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        categoryCounts={categoryCounts}
        selectedModality={selectedModality}
        onModalityChange={handleModalityChange}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      />

      {/* 12-block Grid */}
      <BlockGrid
        blocks={blocks}
        onResetFilters={handleResetFilters}
      />

      {/* Drag & Drop .py file zone */}
      <DropPyZone
        onDropFile={(file) => handleOpenUploadModalWithFile(file)}
      />

      {/* Pagination component: always displayed when items exist, including 1 page */}
      {allFilteredCount > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={allFilteredCount}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Interactive Upload Modal for .py files */}
      <UploadPyModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        initialFile={pendingFile}
        existingBlocks={allBlocks}
        onConfirm={handleModalConfirm}
      />
    </div>
  )
}
