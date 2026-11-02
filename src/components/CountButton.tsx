type CountButtonProps = {
  label: string
  count: number
  onClick: () => void
  disabled?: boolean
}

/**
 * 지도 위에 떠 있는 작은 버튼(기록, 제외). 개수가 있으면 이름 옆에 주황 숫자로 보여주고,
 * 0이면 숫자를 숨긴다.
 */
export function CountButton({
  label,
  count,
  onClick,
  disabled = false,
}: CountButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      // 화면에서는 간격으로 띄우지만 읽을 때는 "제외 3"처럼 붙여 읽히게 이름을 따로 준다.
      aria-label={count > 0 ? `${label} ${count}` : label}
      className="flex items-center gap-2 rounded-[14px] bg-white px-3 py-2 text-[15px] font-medium text-gray-700 shadow-[0_2px_8px_rgba(0,0,0,0.1)] hover:text-gray-900 disabled:opacity-50"
    >
      {label}
      {count > 0 && <span className="text-orange-500">{count}</span>}
    </button>
  )
}
