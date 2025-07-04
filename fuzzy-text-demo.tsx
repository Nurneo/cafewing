"use client"

import * as React from "react"
import { useState } from "react"
import { FuzzyText } from "./fuzzy-text"

export function FuzzyTextDemo() {
  const [enableHover, setEnableHover] = useState(true)
  const [hoverIntensity, setHoverIntensity] = useState(0.4)
  
  return (
    <FuzzyText
      baseIntensity={0.2}
      hoverIntensity={hoverIntensity}
      enableHover={enableHover}
      className="mx-auto"
    >
      404
    </FuzzyText>
  )
}