import { useMemoizedFn } from 'ahooks'

import { ipc, memo } from '@/utils'
import { AirplaneTiltIcon, CheckIcon, XIcon } from '@phosphor-icons/react'

import type { App } from '@/models'

interface IProps {
      access: App['access']
}

const Index = (props: IProps) => {
      const { access } = props
      const keys = Object.keys(access)

      const onItem = useMemoizedFn(item => {
            ipc.access.request.mutate({ access: item })
      })

      return (
            <div
                  className='
				flex flex-col justify-center items-center
				w-screen h-screen
				gap-4
			'
            >
                  <AirplaneTiltIcon className='size-20'></AirplaneTiltIcon>
                  <span>Permissions required</span>
                  <div className='flex flex-col gap-3'>
                        {keys.map(item => (
                              <button
                                    className='
							flex justify-center items-center
							w-72 h-10
							px-4
							bg-std-100
							relative
							rounded-3xl
							clickable capitalize
						'
                                    key={item}
                                    onClick={() => onItem(item)}
                              >
                                    <span>{item.replaceAll('-', ' ')}</span>
                                    {access[item as keyof App['access']] ? (
                                          <CheckIcon
                                                className='text-green-600 absolute right-4'
                                                weight='bold'
                                          ></CheckIcon>
                                    ) : (
                                          <XIcon className='text-red-500 absolute right-4' weight='bold'></XIcon>
                                    )}
                              </button>
                        ))}
                  </div>
            </div>
      )
}

export default memo(Index)
