import { PinLabel } from './PinLabel'

type MapPinProps = {
  name: string
  selected: boolean
  onClick: () => void
}

/**
 * 지도 위 가게 위치. 선택된 가게는 주황 원 위에 이름 말풍선을 띄우고, 나머지는 회색 점.
 * 말풍선은 띄워 두기만 해서 지도 기준점(핀 가운데)이 바뀌지 않고, 주변 핀 클릭도 막지 않는다.
 */
export function MapPin({ name, selected, onClick }: MapPinProps) {
  return (
    <div className="relative">
      {selected && (
        <div className="pointer-events-none absolute bottom-full left-1/2 mb-1 -translate-x-1/2">
          <PinLabel name={name} />
        </div>
      )}
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
    </div>
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
