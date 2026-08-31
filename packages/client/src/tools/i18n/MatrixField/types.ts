export type MatrixHeaderOption =
  | { isEditable: true; createPlaceholder: (columnIndex: number) => string }
  | { isEditable: false }
