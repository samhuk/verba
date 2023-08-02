import { BaseTransportOptions } from "./types"

/**
 * Colors config object for the json-colorizer package for TTY consoles.
 * 
 * See below comment for `DEFAULT_FOREGROUND_JSON_COLORS` about why '1' is used.
 */
const TTY_JSON_COLORS = {
  STRING_KEY: '1', // Make string keys the default foreground color
  NULL_LITERAL: 'grey', // Make null literal values a bit faded
  NUMBER_LITERAL: 'yellow',
  STRING_LITERAL: 'green',
}

/**
 * Colors config object for the json-colorizer package that, due to
 * the package's rubbish way of doing options, is a workaround to enable
 * default foreground colors for text (that will work in light and dark themes).
 */
const DEFAULT_FOREGROUND_JSON_COLORS = {
  BOOLEAN_LITERAL: '1',
  BRACE: '1',
  BRACKET: '1',
  COLON: '1',
  COMMA: '1',
  NULL_LITERAL: '1',
  NUMBER_LITERAL: '1',
  STRING_KEY: '1',
  STRING_LITERAL: '1',
}

export const determineJsonColors = (transportOptions: BaseTransportOptions) => (
  (transportOptions.isTty && !(transportOptions?.disableColors ?? false)) ? TTY_JSON_COLORS : DEFAULT_FOREGROUND_JSON_COLORS
)
