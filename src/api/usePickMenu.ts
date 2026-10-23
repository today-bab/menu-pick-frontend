import { useMutation } from '@tanstack/react-query'
import { pickMenu } from './pickMenu'
import type { PickError, PickRequest, PickResult } from './types'

export function usePickMenu() {
  return useMutation<PickResult, PickError, PickRequest>({
    mutationFn: pickMenu,
  })
}
