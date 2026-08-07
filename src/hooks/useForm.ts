'use client'

import { useState, useCallback, ChangeEvent, FormEvent } from 'react'
import { toast } from 'sonner'

export function useForm<T extends object>(
  initialValues: T,
  onSubmit: (values: T) => void | Promise<void>
) {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target
      setValues((prev) => ({
        ...prev,
        [name]: value,
      }))
      // Clear error when user starts typing
      if (errors[name as keyof T]) {
        setErrors((prev) => ({
          ...prev,
          [name]: undefined,
        }))
      }
    },
    [errors]
  )

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      setIsSubmitting(true)
      try {
        await onSubmit(values)
      } catch (error) {
        console.error('[v0] Form submission error:', error)
        toast.error(error instanceof Error ? error.message : 'Something went wrong')
      } finally {
        setIsSubmitting(false)
      }
    },
    [values, onSubmit]
  )

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
  }, [initialValues])

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    reset,
    setValues,
    setErrors,
  }
}
