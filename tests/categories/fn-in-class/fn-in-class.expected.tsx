function Component() {
      return (
            <div
                  className={cx(
                        `
                        custom-btn
                        primary-color
                        large-size
                        hover-effect shadow-md
                        rounded-lg p-4 m-2
                  `,
                        `
                        shadow-lg opacity-75 border-2 text-xl font-bold
                        bg-blue-500 from-blue-500 w-full h-64 flex items-center
                        justify-between
                        rounded-lg p-4 m-2
                  `,
                  )}
            >
                  Custom Categories Content
            </div>
      )
}
