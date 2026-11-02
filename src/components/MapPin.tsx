type MapPinProps = {
  name: string
  selected: boolean
  onClick: () => void
}

/** 지도 위 가게 위치. 선택된 가게는 주황 원, 나머지는 회색 점. */
export function MapPin({ name, selected, onClick }: MapPinProps) {
  return (
    <button
      type="button"
      aria-label={name}
      aria-pressed={selected}
      onClick={onClick}
      className={`block rounded-full border-white bg-clip-padding shadow-[0_1px_4px_rgba(0,0,0,0.25)] ${
        selected
          ? 'size-[22px] border-[3px] bg-orange-500'
          : 'size-3.5 border-2 bg-gray-500 hover:bg-gray-700'
      }`}
    />
  )
}

/** 내 위치. 파란 점과 연한 테두리. */
export function MeDot() {
  return (
    <div
      aria-label="내 위치"
      className="size-4 rounded-full border-[3px] border-white bg-blue-500 shadow-[0_0_0_8px_rgba(59,130,246,0.2)]"
    />
  )
}
