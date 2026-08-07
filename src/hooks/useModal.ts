'use client'

import { useState, useCallback } from 'react'

export type ModalType = 'create' | 'edit' | 'delete' | 'view' | null

export interface UseModalReturn {
  isOpen: boolean
  modalType: ModalType
  selectedId: string | null
  open: (type: ModalType, id?: string) => void
  close: () => void
}

export function useModal(): UseModalReturn {
  const [isOpen, setIsOpen] = useState(false)
  const [modalType, setModalType] = useState<ModalType>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const open = useCallback((type: ModalType, id?: string) => {
    setModalType(type)
    setSelectedId(id || null)
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
    setModalType(null)
    setSelectedId(null)
  }, [])

  return {
    isOpen,
    modalType,
    selectedId,
    open,
    close,
  }
}
