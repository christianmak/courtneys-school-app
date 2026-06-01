/**
 * Compute how an image fits within a canvas using object-fit: contain logic.
 * Returns the image's display position and dimensions within the canvas.
 */
export function computeImageFit(naturalWidth, naturalHeight, canvasWidth, canvasHeight) {
  if (!naturalWidth || !naturalHeight) {
    return { x: 0, y: 0, width: canvasWidth, height: canvasHeight }
  }
  const imgAspect = naturalWidth / naturalHeight
  const canvasAspect = canvasWidth / canvasHeight
  let w, h
  if (imgAspect > canvasAspect) {
    w = canvasWidth
    h = canvasWidth / imgAspect
  } else {
    h = canvasHeight
    w = canvasHeight * imgAspect
  }
  return {
    x: (canvasWidth - w) / 2,
    y: (canvasHeight - h) / 2,
    width: w,
    height: h,
  }
}

/**
 * Convert canvas-absolute rect to ratios relative to image display area.
 */
export function rectToRatios(rect, fit) {
  return {
    x_ratio: (rect.x - fit.x) / fit.width,
    y_ratio: (rect.y - fit.y) / fit.height,
    w_ratio: rect.width / fit.width,
    h_ratio: rect.height / fit.height,
  }
}

/**
 * Convert ratios back to canvas-absolute rect using current image fit.
 */
export function ratiosToRect(label, fit) {
  return {
    x: fit.x + label.x_ratio * fit.width,
    y: fit.y + label.y_ratio * fit.height,
    width: label.w_ratio * fit.width,
    height: label.h_ratio * fit.height,
  }
}

/**
 * Convert canvas-absolute pin to ratios relative to image display area.
 */
export function pinToRatios(pin, fit) {
  return {
    pin_x_ratio: (pin.x - fit.x) / fit.width,
    pin_y_ratio: (pin.y - fit.y) / fit.height,
  }
}

/**
 * Convert ratio pin back to canvas-absolute using current image fit.
 */
export function ratiosToPin(label, fit) {
  return {
    x: fit.x + label.pin_x_ratio * fit.width,
    y: fit.y + label.pin_y_ratio * fit.height,
  }
}
