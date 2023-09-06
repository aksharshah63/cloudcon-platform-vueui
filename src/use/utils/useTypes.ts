export default {
  checkboxTypes: ["checkbox"],

  currencyTypes: ["currency"],

  dateTypes: ["date", "datetime"],

  numberTypes: [
    "decimal",
    "duration",
    "numeric",
    "score",
    "number",
    "integer",
  ],

  selectMultiTypes: ["selectmulti"],

  selectTypes: ["select"],

  textTypes: [
    "barcode",
    "email",
    "phone",
    "text",
    "textarea",
    "string",
  ],

  timeTypes: ["time"],

  toggleTypes: ["toggle"],

  unusedTypes: [
    "button",
    "drawing",
    "form",
    "formula",
    "header",
    "label",
  ],

  upviseTableTypes: {
    contact: { table: "unybiz.contacts.contacts" },
    company: { table: "unybiz.contacts.companies" },
    opp: { table: "unybiz.sales.opportunities" },
    product: { table: "unybiz.sales.products" },
    project: { table: "unybiz.projects.projects" },
    risk: { table: "qhse.risks" },
    tool: { table: "tools.tools" },
    user: { table: "system.user.users", filters:[{ field: "status", value: 1 }] },
  },

  valueProvidedTypes: ["file", "image", "link", "photo", "signature"],

  currencyValueOptions: [
    { name: "U.S. Dollar", value: "USD" },
    { name: "Euro", value: "EUR" },
    { name: "British Pound", value: "GBP" },
    { name: "Japanese Yen", value: "JPY" },
    { name: "Canadian Dollar", value: "CAD" },
    { name: "Australian Dollar", value: "AUD" },
    { name: "Swiss Franc", value: "CHF" },
    { name: "Hong Kong Dollar", value: "HKD" },
    { name: "New Zealand Dollar", value: "NZD" },
    { name: "Singapore Dollar", value: "SGD" },
    { name: "Sri Lanka Rupee", value: "LKR" },
    { name: "Swedish Krona", value: "SEK" },
  ]
}