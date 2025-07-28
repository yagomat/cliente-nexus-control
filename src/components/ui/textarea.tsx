
import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  showCharacterCount?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, showCharacterCount, maxLength, ...props }, ref) => {
    // Determinar se o componente é controlado ou descontrolado
    const isControlled = props.value !== undefined
    
    // Usar estado interno apenas se não for controlado
    const [internalValue, setInternalValue] = React.useState(props.defaultValue || "")
    
    // Usar o valor apropriado baseado no tipo de controle
    const currentValue = isControlled ? props.value : internalValue
    
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none",
            className
          )}
          ref={ref}
          maxLength={maxLength}
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
Textarea.displayName = "Textarea"

export { Textarea }
