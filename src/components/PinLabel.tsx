type PinLabelProps = {
  name: string
}

/**
 * 지도 핀 위에 띄우는 가게 이름 말풍선. 아래쪽 꼬리가 핀을 가리킨다.
 * 핀 버튼이 이미 이름을 읽어 주므로 보조기기에는 숨긴다.
 */
export function PinLabel({ name }: PinLabelProps) {
  return (
    <div
      aria-hidden="true"
      className="flex flex-col items-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]"
    >
      <span className="block max-w-[180px] truncate rounded-full bg-white px-2.5 py-1 text-[13px] font-medium text-gray-900">
        {name}
      </span>
      <span className="-mt-px size-0 border-x-[5px] border-t-[6px] border-x-transparent border-t-white" />
    </div>
  )
}
