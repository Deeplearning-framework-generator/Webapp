import { useState, useMemo, useEffect } from 'react'

export function formatDisplayName(rawName) {
  if (!rawName) return 'Custom Block'
  const clean = rawName.replace(/\.py$/i, '')
  if (clean.includes('_') || clean.includes('-')) {
    return clean
      .split(/[-_]+/)
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
  }
  return clean
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')
    .trim()
}

// Initial list of blocks based on the exact UI screenshot and additional ML blocks for pagination testing
const INITIAL_BLOCKS = [
  {
    id: '1',
    name: 'CIFAR-10',
    category: 'DATA',
    version: 'Built-in',
    inputs: [],
    outputs: ['out image [3,32,32]', 'out label'],
    footer: 'Image, used in 1 project',
    modality: 'Image'
  },
  {
    id: '2',
    name: 'Speech Commands',
    category: 'DATA',
    version: 'Hugging Face',
    inputs: [],
    outputs: ['out waveform [16000]', 'out label'],
    footer: 'Audio, used in 1 project',
    modality: 'Audio'
  },
  {
    id: '3',
    name: 'Conv Block',
    category: 'LAYER',
    version: 'v3',
    inputs: ['in [B,C,H,W]'],
    outputs: ['out [B,C,H,W]'],
    footer: 'Image, used in 2 projects',
    modality: 'Image'
  },
  {
    id: '4',
    name: 'Residual Block',
    category: 'LAYER',
    version: 'v1',
    inputs: ['in [B,C,H,W]'],
    outputs: ['out main, skip'],
    footer: 'Image, 2 parallel outputs',
    modality: 'Image'
  },
  {
    id: '5',
    name: 'Patch Embedding',
    category: 'LAYER',
    version: 'v2',
    inputs: ['in [B,3,H,W]'],
    outputs: ['out [B,N,D]'],
    footer: 'Image, used in 1 project',
    modality: 'Image'
  },
  {
    id: '6',
    name: 'Transformer Encoder',
    category: 'LAYER',
    version: 'Built-in',
    inputs: ['in [B,N,D]'],
    outputs: ['out [B,N,D]'],
    footer: 'Text and image',
    modality: 'Text'
  },
  {
    id: '7',
    name: 'Spectrogram',
    category: 'LAYER',
    version: 'v1',
    inputs: ['in [B,T]'],
    outputs: ['out [B,F,T]'],
    footer: 'Audio, used in 1 project',
    modality: 'Audio'
  },
  {
    id: '8',
    name: 'Add',
    category: 'MERGE',
    version: 'Built-in',
    inputs: ['in a, b (same shape)'],
    outputs: ['out a + b'],
    footer: 'Any modality',
    modality: 'All'
  },
  {
    id: '9',
    name: 'Concat',
    category: 'MERGE',
    version: 'Built-in',
    inputs: ['in 2 or more'],
    outputs: ['out joined on a dim'],
    footer: 'Any modality',
    modality: 'All'
  },
  {
    id: '10',
    name: 'Cross Entropy',
    category: 'LOSS',
    version: 'Built-in',
    inputs: ['in pred, target'],
    outputs: ['ends the canvas'],
    footer: 'Classification',
    modality: 'Classification'
  },
  {
    id: '11',
    name: 'Focal Loss',
    category: 'LOSS',
    version: 'v2',
    inputs: ['in pred, target'],
    outputs: ['ends the canvas'],
    footer: 'Custom, uploaded file',
    modality: 'Classification'
  },
  {
    id: '12',
    name: 'Early Stop on Plateau',
    category: 'CALLBACK',
    version: 'v1',
    inputs: ['runs on epoch end'],
    outputs: ['no connections'],
    footer: 'Any project',
    modality: 'All'
  },
  // Page 2 items for testing pagination
  {
    id: '13',
    name: 'MNIST Digits',
    category: 'DATA',
    version: 'Built-in',
    inputs: [],
    outputs: ['out image [1,28,28]', 'out label'],
    footer: 'Image, benchmark dataset',
    modality: 'Image'
  },
  {
    id: '14',
    name: 'Linear Layer',
    category: 'LAYER',
    version: 'v1',
    inputs: ['in [B, in_features]'],
    outputs: ['out [B, out_features]'],
    footer: 'Used in 4 projects',
    modality: 'All'
  },
  {
    id: '15',
    name: 'BatchNorm2d',
    category: 'LAYER',
    version: 'v2',
    inputs: ['in [B,C,H,W]'],
    outputs: ['out [B,C,H,W]'],
    footer: 'Normalization layer',
    modality: 'Image'
  },
  {
    id: '16',
    name: 'Max Pooling',
    category: 'LAYER',
    version: 'v1',
    inputs: ['in [B,C,H,W]'],
    outputs: ['out [B,C,H/2,W/2]'],
    footer: 'Downsampling layer',
    modality: 'Image'
  },
  {
    id: '17',
    name: 'MSE Loss',
    category: 'LOSS',
    version: 'Built-in',
    inputs: ['in pred, target'],
    outputs: ['scalar loss'],
    footer: 'Regression tasks',
    modality: 'All'
  },
  {
    id: '18',
    name: 'Model Checkpoint',
    category: 'CALLBACK',
    version: 'Built-in',
    inputs: ['runs on val_loss min'],
    outputs: ['saves .pt weights'],
    footer: 'Model persistence callback',
    modality: 'All'
  }
]

export const CATEGORIES = [
  { key: 'All', label: 'All', colorDot: null },
  { key: 'DATA', label: 'Data', colorDot: 'bg-emerald-500' },
  { key: 'LAYER', label: 'Layer', colorDot: 'bg-indigo-500' },
  { key: 'MERGE', label: 'Merge', colorDot: 'bg-amber-500' },
  { key: 'LOSS', label: 'Loss', colorDot: 'bg-rose-500' },
  { key: 'CALLBACK', label: 'Callback', colorDot: 'bg-slate-600' }
]

export const MODALITIES = ['All', 'Image', 'Audio', 'Text', 'Classification']

export function useBlocks() {
  const [blocks, setBlocks] = useState(INITIAL_BLOCKS)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedModality, setSelectedModality] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 12

  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [notification, setNotification] = useState(null)
  const [backendConnected, setBackendConnected] = useState(false)

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type })
    setTimeout(() => {
      setNotification(null)
    }, 4000)
  }

  // Fetch real blocks from Backend API on mount
  const fetchBlocksFromBackend = async () => {
    try {
      const res = await fetch('/api/v1/blocks?all=true&sort=newest')
      if (res.ok) {
        const json = await res.json()
        if (json && Array.isArray(json.data) && json.data.length > 0) {
          // Normalize block format from API and format names nicely
          const normalized = json.data.map((item) => ({
            id: String(item.id),
            name: formatDisplayName(item.name),
            category: item.category || 'LAYER',
            version: item.version || 'v1',
            inputs: item.inputs || [],
            outputs: item.outputs || [],
            footer: item.footer || `${item.modality}, uploaded file`,
            modality: item.modality || 'All',
            stars_count: item.stars_count || 0,
            usage_count: item.usage_count || 0
          }))
          setBlocks(normalized)
          setBackendConnected(true)
          return
        }
      }
    } catch {
      // Backend not running, gracefully keep INITIAL_BLOCKS
    }
    setBackendConnected(false)
  }

  useEffect(() => {
    fetchBlocksFromBackend()
  }, [])

  // Calculate dynamic category counts
  const categoryCounts = useMemo(() => {
    const counts = { All: blocks.length, DATA: 0, LAYER: 0, MERGE: 0, LOSS: 0, CALLBACK: 0 }
    blocks.forEach((b) => {
      if (counts[b.category] !== undefined) {
        counts[b.category]++
      }
    })
    return counts
  }, [blocks])

  // Filter blocks based on search, category, and modality
  const filteredBlocks = useMemo(() => {
    return blocks.filter((b) => {
      const matchCategory = selectedCategory === 'All' || b.category === selectedCategory

      // Precise modality filtering:
      // When a specific modality is chosen (e.g. Text), ONLY show blocks that specifically support Text!
      const matchModality = (() => {
        if (selectedModality === 'All') return true
        const blockMod = (b.modality || '').toLowerCase()
        const blockFooter = (b.footer || '').toLowerCase()
        const target = selectedModality.toLowerCase()

        if (target === 'text') {
          return blockMod === 'text' || blockMod === 'text and image' || blockFooter.includes('text')
        }
        if (target === 'audio') {
          return blockMod === 'audio' || blockFooter.includes('audio')
        }
        if (target === 'image') {
          return blockMod === 'image' || blockFooter.includes('image')
        }
        if (target === 'classification') {
          return blockMod === 'classification' || blockFooter.includes('classification')
        }
        return blockMod === target
      })()
      
      const query = searchQuery.trim().toLowerCase()
      const matchSearch =
        !query ||
        b.name.toLowerCase().includes(query) ||
        b.category.toLowerCase().includes(query) ||
        b.footer.toLowerCase().includes(query)

      return matchCategory && matchModality && matchSearch
    })
  }, [blocks, selectedCategory, selectedModality, searchQuery])

  // Pagination calculation
  const totalItems = filteredBlocks.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const safePage = Math.min(currentPage, totalPages)

  const paginatedBlocks = useMemo(() => {
    const start = (safePage - 1) * pageSize
    return filteredBlocks.slice(start, start + pageSize)
  }, [filteredBlocks, safePage, pageSize])

  // Handlers
  const handleCategoryChange = (catKey) => {
    setSelectedCategory(catKey)
    setCurrentPage(1)
  }

  const handleModalityChange = (mod) => {
    setSelectedModality(mod)
    setCurrentPage(1)
  }

  const handleSearchChange = (q) => {
    setSearchQuery(q)
    setCurrentPage(1)
  }

  // Upload .py file or process Python code text with Backend API + fallback
  const addBlockFromPyFile = async (fileOrContent, fileName = 'custom_module.py', options = {}) => {
    const userCategory = options.category
    const userModality = options.modality

    try {
      if (typeof fileOrContent === 'string' || fileOrContent instanceof File) {
        const codeText = typeof fileOrContent === 'string' ? fileOrContent : await fileOrContent.text()
        
        // Parse code first to get class name, inputs, outputs, params
        const parseRes = await fetch('/api/v1/blocks/parse-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: codeText, file_name: fileName })
        })
        const parsed = parseRes.ok ? await parseRes.json() : null

        const finalCategory = userCategory || parsed?.category || 'LAYER'
        const finalModality = userModality || parsed?.modality || 'All'
        const rawBlockName = options.name || parsed?.name || formatDisplayName(fileName)
        const blockName = formatDisplayName(rawBlockName)
        const regName = parsed?.registry_name || blockName.toLowerCase().replace(/[^a-z0-9]+/g, '_')

        // Adapt IO signatures for Dataset category
        let finalInputs = parsed?.inputs || ['in [B, ...]']
        let finalOutputs = parsed?.outputs || ['out [B, ...]']
        let baseClass = parsed?.base_class || 'nn.Module'

        if (finalCategory === 'DATA') {
          finalInputs = []
          const modLower = finalModality.toLowerCase()
          if (modLower.includes('image')) {
            finalOutputs = ['out image [3,32,32]', 'out label']
          } else if (modLower.includes('audio')) {
            finalOutputs = ['out waveform [16000]', 'out label']
          } else if (modLower.includes('text')) {
            finalOutputs = ['out token ids', 'out label']
          } else {
            finalOutputs = ['out data', 'out label']
          }
          baseClass = 'Dataset'
        }

        // Save to backend DB via /api/v1/blocks/create
        const targetVersion = options.version || 'v1'
        const replaceExisting = Boolean(options.replaceExisting)
        const existingBlockId = options.existingBlockId ? Number(options.existingBlockId) : null

        const createRes = await fetch('/api/v1/blocks/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: blockName,
            category: finalCategory,
            modality: finalModality,
            registry_name: regName,
            base_class: baseClass,
            code: codeText,
            file_name: fileName,
            inputs: finalInputs,
            outputs: finalOutputs,
            params: parsed?.params || [],
            version: targetVersion,
            replace_existing: replaceExisting,
            existing_block_id: existingBlockId
          })
        })

        if (createRes.ok) {
          const created = await createRes.json()
          const newBlock = {
            id: String(created.id),
            name: formatDisplayName(created.name),
            category: created.category || finalCategory,
            version: targetVersion || created.version || 'v1',
            inputs: created.inputs || finalInputs,
            outputs: created.outputs || finalOutputs,
            footer: `${created.modality || finalModality}, ${created.category || finalCategory}`,
            modality: created.modality || finalModality
          }

          if (replaceExisting && existingBlockId) {
            setBlocks((prev) => [
              newBlock,
              ...prev.filter(
                (b) => String(b.id) !== String(existingBlockId) && b.name.toLowerCase() !== newBlock.name.toLowerCase()
              )
            ])
            showNotification(`Updated block "${newBlock.name}" to version ${newBlock.version}`)
          } else {
            setBlocks((prev) => [newBlock, ...prev])
            showNotification(`Saved block "${newBlock.name}" (${newBlock.category} - ${newBlock.modality}) to database`)
          }

          setSelectedCategory('All')
          setSelectedModality('All')
          setSearchQuery('')
          setCurrentPage(1)
          setBackendConnected(true)
          return
        }
      }
    } catch {
      // Backend offline, fallback to client state
    }

    // Client fallback if backend is offline
    const rawFallbackName = options.name || formatDisplayName(typeof fileOrContent === 'string' ? fileName : fileOrContent.name)
    const blockName = formatDisplayName(rawFallbackName)
    
    const finalCategory = userCategory || 'LAYER'
    const finalModality = userModality || 'All'

    let finalInputs = ['in [B, ...]']
    let finalOutputs = ['out [B, ...]']
    if (finalCategory === 'DATA') {
      finalInputs = []
      finalOutputs = ['out data', 'out label']
    }

    const targetVersion = options.version || 'v1'
    const newBlock = {
      id: options.existingBlockId ? String(options.existingBlockId) : String(Date.now()),
      name: blockName,
      category: finalCategory,
      version: targetVersion,
      inputs: finalInputs,
      outputs: finalOutputs,
      footer: `${finalModality}, from ${fileName}`,
      modality: finalModality
    }

    if (options.replaceExisting && options.existingBlockId) {
      setBlocks((prev) => [
        newBlock,
        ...prev.filter(
          (b) => String(b.id) !== String(options.existingBlockId) && b.name.toLowerCase() !== newBlock.name.toLowerCase()
        )
      ])
      showNotification(`Updated block "${newBlock.name}" to version ${newBlock.version}`)
    } else {
      setBlocks((prev) => [newBlock, ...prev])
      showNotification(`Added block "${newBlock.name}" (${newBlock.category} - ${newBlock.modality})`)
    }
    setSelectedCategory('All')
    setSelectedModality('All')
    setSearchQuery('')
    setCurrentPage(1)
  }

  const addDataset = (datasetName = 'Custom Dataset') => {
    const newBlock = {
      id: String(Date.now()),
      name: datasetName,
      category: 'DATA',
      version: 'Uploaded',
      inputs: [],
      outputs: ['out data', 'out labels'],
      footer: 'Custom dataset, uploaded',
      modality: 'All'
    }

    setBlocks((prev) => [newBlock, ...prev])
    setSelectedCategory('All')
    setSelectedModality('All')
    setSearchQuery('')
    setCurrentPage(1)
    showNotification(`Added dataset block "${newBlock.name}"`)
  }

  return {
    blocks: paginatedBlocks,
    allBlocks: blocks,
    allFilteredCount: filteredBlocks.length,
    totalBlocksCount: blocks.length,
    selectedCategory,
    selectedModality,
    searchQuery,
    currentPage: safePage,
    totalPages,
    pageSize,
    categoryCounts,
    uploadModalOpen,
    notification,
    backendConnected,
    setUploadModalOpen,
    handleCategoryChange,
    handleModalityChange,
    handleSearchChange,
    setCurrentPage,
    addBlockFromPyFile,
    addDataset,
    showNotification,
    refreshBlocks: fetchBlocksFromBackend
  }
}
