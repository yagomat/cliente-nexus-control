
import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps extends React.ComponentProps<"input"> {
  maxLength?: number
  showCharacterCount?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, maxLength, showCharacterCount, ...props }, ref) => {
    // Determinar se o componente é controlado ou descontrolado
    const isControlled = props.value !== undefined
    
    // Usar estado interno apenas se não for controlado
    const [internalValue, setInternalValue] = React.useState(props.defaultValue || "")
    
    // Usar o valor apropriado baseado no tipo de controle
    const currentValue = isControlled ? props.value : internalValue
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) {
        setInternalValue(e.target.value)
      }
      if (props.onChange) {
        props.onChange(e)
      }
    }

    const currentLength = String(currentValue).length
    const isAtLimit = maxLength && currentLength >= maxLength

    return (
      <div className="w-full">
        <input
          type={type}
          maxLength={maxLength}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            className
          )}
          ref={ref}
          {...props}
          value={currentValue}
          onChange={handleChange}
        />
        {showCharacterCount && maxLength && isAtLimit && (
          <p className="text-sm text-destructive mt-1">
            Limite de {maxLength} caracteres atingido
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
