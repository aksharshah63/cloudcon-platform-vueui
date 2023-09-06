import { DataFilter } from "../dataFilter";
import {
  DataFilterBooleanOperator,
  DataFilterCondition,
  DataFilterNumberOperator,
  DataFilterStringOperator,
  DataFilterType,
  IDataFilterRule,
  IDataFilters,
} from "../dataFilterInterfaces";

const dataFilter = new DataFilter();
const arrayData: Record<string, unknown>[] = [
  {
    id: "id1",
    name: "Chris Redfield",
    isActive: true,
    points: 15,
  },
  {
    id: "id2",
    name: "Claire Redfield",
    isActive: false,
    points: -3,
  },
  {
    id: "id3",
    name: "Ethan Winters",
    isActive: false,
    points: 15,
  },
  {
    id: "id4",
    name: "Ada Wong",
    isActive: true,
    points: 1,
  },
  {
    id: "id5",
    name: "Sonik",
    isActive: true,
    points: 13,
  },
  {
    id: "id6",
    name: "",
    isActive: false,
    points: 0,
  },
  {
    id: "id7",
    name: null,
    isActive: undefined,
    points: undefined,
  },
  {
    id: "id8",
    name: undefined,
    isActive: null,
    points: null,
  },
];
const dictionaryData: Record<string, Record<string, unknown>> = {
  id1: {
    id: "id1",
    name: "Chris Redfield",
    isActive: true,
    points: 15,
  },
  id2: {
    id: "id2",
    name: "Claire Redfield",
    isActive: false,
    points: -3,
  },
  id3: {
    id: "id3",
    name: "Ethan Winters",
    isActive: false,
    points: 15,
  },
  id4: {
    id: "id4",
    name: "Ada Wong",
    isActive: true,
    points: 1,
  },
  id5: {
    id: "id5",
    name: "Sonik",
    isActive: true,
    points: 13,
  },
  id6: {
    id: "id6",
    name: "",
    isActive: false,
    points: 0,
  },
  id7: {
    id: "id7",
    name: null,
    isActive: undefined,
    points: undefined,
  },
  id8: {
    id: "id8",
    name: undefined,
    isActive: null,
    points: null,
  },
};
const filterArrayData: Record<
  string,
  {
    data: Record<string, unknown>[];
    filters: IDataFilterRule | IDataFilters;
    expected: Record<string, unknown>[];
  }
> = {
  "Should return no data when no data is passed": {
    data: [],
    filters: {
      field: "name",
      type: DataFilterType.STRING,
      operator: DataFilterStringOperator.BEGINS_WITH,
      value: "wer",
    },
    expected: [],
  },
  'Should return data correctly when "EQUAL" string filter passed': {
    data: arrayData,
    filters: {
      field: "name",
      type: DataFilterType.STRING,
      operator: DataFilterStringOperator.EQUAL,
      value: "Chris Redfield",
    },
    expected: [
      {
        id: "id1",
        name: "Chris Redfield",
        isActive: true,
        points: 15,
      },
    ],
  },
  'Should return data correctly when "NOT_EQUAL" string filter passed': {
    data: arrayData,
    filters: {
      field: "name",
      type: DataFilterType.STRING,
      operator: DataFilterStringOperator.NOT_EQUAL,
      value: "Chris Redfield",
    },
    expected: [
      {
        id: "id2",
        name: "Claire Redfield",
        isActive: false,
        points: -3,
      },
      {
        id: "id3",
        name: "Ethan Winters",
        isActive: false,
        points: 15,
      },
      {
        id: "id4",
        name: "Ada Wong",
        isActive: true,
        points: 1,
      },
      {
        id: "id5",
        name: "Sonik",
        isActive: true,
        points: 13,
      },
      {
        id: "id6",
        name: "",
        isActive: false,
        points: 0,
      },
      {
        id: "id7",
        name: null,
        isActive: undefined,
        points: undefined,
      },
      {
        id: "id8",
        name: undefined,
        isActive: null,
        points: null,
      },
    ],
  },
  'Should return data correctly when "IN" string filter passed': {
    data: arrayData,
    filters: {
      field: "name",
      type: DataFilterType.STRING,
      operator: DataFilterStringOperator.IN,
      value: ["Ada", "Wong", "Claire Redfield", "Ethan Winters", ""],
    },
    expected: [
      {
        id: "id2",
        name: "Claire Redfield",
        isActive: false,
        points: -3,
      },
      {
        id: "id3",
        name: "Ethan Winters",
        isActive: false,
        points: 15,
      },
      {
        id: "id6",
        name: "",
        isActive: false,
        points: 0,
      },
    ],
  },
  'Should return data correctly when "NOT_IN" string filter passed': {
    data: arrayData,
    filters: {
      field: "name",
      type: DataFilterType.STRING,
      operator: DataFilterStringOperator.NOT_IN,
      value: ["Ada", "Wong", "Claire Redfield", "Ethan Winters", ""],
    },
    expected: [
      {
        id: "id1",
        name: "Chris Redfield",
        isActive: true,
        points: 15,
      },
      {
        id: "id4",
        name: "Ada Wong",
        isActive: true,
        points: 1,
      },
      {
        id: "id5",
        name: "Sonik",
        isActive: true,
        points: 13,
      },
    ],
  },
  'Should return data correctly when "BEGINS_WITH" string filter passed': {
    data: arrayData,
    filters: {
      field: "name",
      type: DataFilterType.STRING,
      operator: DataFilterStringOperator.BEGINS_WITH,
      value: "Ada",
    },
    expected: [
      {
        id: "id4",
        name: "Ada Wong",
        isActive: true,
        points: 1,
      },
    ],
  },
  'Should return data correctly when "NOT_BEGINS_WITH" string filter passed': {
    data: arrayData,
    filters: {
      field: "name",
      type: DataFilterType.STRING,
      operator: DataFilterStringOperator.NOT_BEGINS_WITH,
      value: "Ada",
    },
    expected: [
      {
        id: "id1",
        name: "Chris Redfield",
        isActive: true,
        points: 15,
      },
      {
        id: "id2",
        name: "Claire Redfield",
        isActive: false,
        points: -3,
      },
      {
        id: "id3",
        name: "Ethan Winters",
        isActive: false,
        points: 15,
      },
      {
        id: "id5",
        name: "Sonik",
        isActive: true,
        points: 13,
      },
      {
        id: "id6",
        name: "",
        isActive: false,
        points: 0,
      },
      {
        id: "id7",
        name: null,
        isActive: undefined,
        points: undefined,
      },
      {
        id: "id8",
        name: undefined,
        isActive: null,
        points: null,
      },
    ],
  },
  'Should return data correctly when "CONTAINS" string filter passed': {
    data: arrayData,
    filters: {
      field: "name",
      type: DataFilterType.STRING,
      operator: DataFilterStringOperator.CONTAINS,
      value: "on",
    },
    expected: [
      {
        id: "id4",
        name: "Ada Wong",
        isActive: true,
        points: 1,
      },
      {
        id: "id5",
        name: "Sonik",
        isActive: true,
        points: 13,
      },
    ],
  },
  'Should return data correctly when "NOT_CONTAINS" string filter passed': {
    data: arrayData,
    filters: {
      field: "name",
      type: DataFilterType.STRING,
      operator: DataFilterStringOperator.NOT_CONTAINS,
      value: "on",
    },
    expected: [
      {
        id: "id1",
        name: "Chris Redfield",
        isActive: true,
        points: 15,
      },
      {
        id: "id2",
        name: "Claire Redfield",
        isActive: false,
        points: -3,
      },
      {
        id: "id3",
        name: "Ethan Winters",
        isActive: false,
        points: 15,
      },
      {
        id: "id6",
        name: "",
        isActive: false,
        points: 0,
      },
      {
        id: "id7",
        name: null,
        isActive: undefined,
        points: undefined,
      },
      {
        id: "id8",
        name: undefined,
        isActive: null,
        points: null,
      },
    ],
  },
  'Should return data correctly when "ENDS_WITH" string filter passed': {
    data: arrayData,
    filters: {
      field: "name",
      type: DataFilterType.STRING,
      operator: DataFilterStringOperator.ENDS_WITH,
      value: "Redfield",
    },
    expected: [
      {
        id: "id1",
        name: "Chris Redfield",
        isActive: true,
        points: 15,
      },
      {
        id: "id2",
        name: "Claire Redfield",
        isActive: false,
        points: -3,
      },
    ],
  },
  'Should return data correctly when "NOT_ENDS_WITH" string filter passed': {
    data: arrayData,
    filters: {
      field: "name",
      type: DataFilterType.STRING,
      operator: DataFilterStringOperator.NOT_ENDS_WITH,
      value: "Redfield",
    },
    expected: [
      {
        id: "id3",
        name: "Ethan Winters",
        isActive: false,
        points: 15,
      },
      {
        id: "id4",
        name: "Ada Wong",
        isActive: true,
        points: 1,
      },
      {
        id: "id5",
        name: "Sonik",
        isActive: true,
        points: 13,
      },
      {
        id: "id6",
        name: "",
        isActive: false,
        points: 0,
      },
      {
        id: "id7",
        name: null,
        isActive: undefined,
        points: undefined,
      },
      {
        id: "id8",
        name: undefined,
        isActive: null,
        points: null,
      },
    ],
  },
  'Should return data correctly when "IS_EMPTY" string filter passed': {
    data: arrayData,
    filters: {
      field: "name",
      type: DataFilterType.STRING,
      operator: DataFilterStringOperator.IS_EMPTY,
      value: "",
    },
    expected: [
      {
        id: "id6",
        name: "",
        isActive: false,
        points: 0,
      },
    ],
  },
  'Should return data correctly when "IS_NOT_EMPTY" string filter passed': {
    data: arrayData,
    filters: {
      field: "name",
      type: DataFilterType.STRING,
      operator: DataFilterStringOperator.IS_NOT_EMPTY,
      value: "",
    },
    expected: [
      {
        id: "id1",
        name: "Chris Redfield",
        isActive: true,
        points: 15,
      },
      {
        id: "id2",
        name: "Claire Redfield",
        isActive: false,
        points: -3,
      },
      {
        id: "id3",
        name: "Ethan Winters",
        isActive: false,
        points: 15,
      },
      {
        id: "id4",
        name: "Ada Wong",
        isActive: true,
        points: 1,
      },
      {
        id: "id5",
        name: "Sonik",
        isActive: true,
        points: 13,
      },
      {
        id: "id7",
        name: null,
        isActive: undefined,
        points: undefined,
      },
      {
        id: "id8",
        name: undefined,
        isActive: null,
        points: null,
      },
    ],
  },
  'Should return data correctly when "IS_NULL" string filter passed': {
    data: arrayData,
    filters: {
      field: "name",
      type: DataFilterType.STRING,
      operator: DataFilterStringOperator.IS_NULL,
      value: "",
    },
    expected: [
      {
        id: "id7",
        name: null,
        isActive: undefined,
        points: undefined,
      },
      {
        id: "id8",
        name: undefined,
        isActive: null,
        points: null,
      },
    ],
  },
  'Should return data correctly when "IS_NOT_NULL" string filter passed': {
    data: arrayData,
    filters: {
      field: "name",
      type: DataFilterType.STRING,
      operator: DataFilterStringOperator.IS_NOT_NULL,
      value: "",
    },
    expected: [
      {
        id: "id1",
        name: "Chris Redfield",
        isActive: true,
        points: 15,
      },
      {
        id: "id2",
        name: "Claire Redfield",
        isActive: false,
        points: -3,
      },
      {
        id: "id3",
        name: "Ethan Winters",
        isActive: false,
        points: 15,
      },
      {
        id: "id4",
        name: "Ada Wong",
        isActive: true,
        points: 1,
      },
      {
        id: "id5",
        name: "Sonik",
        isActive: true,
        points: 13,
      },
      {
        id: "id6",
        name: "",
        isActive: false,
        points: 0,
      },
    ],
  },
  'Should return data correctly when "EQUAL" number filter passed': {
    data: arrayData,
    filters: {
      field: "points",
      type: DataFilterType.NUMBER,
      operator: DataFilterNumberOperator.EQUAL,
      value: 15,
    },
    expected: [
      {
        id: "id1",
        name: "Chris Redfield",
        isActive: true,
        points: 15,
      },
      {
        id: "id3",
        name: "Ethan Winters",
        isActive: false,
        points: 15,
      },
    ],
  },
  'Should return data correctly when "NOT_EQUAL" number filter passed': {
    data: arrayData,
    filters: {
      field: "points",
      type: DataFilterType.NUMBER,
      operator: DataFilterNumberOperator.NOT_EQUAL,
      value: 15,
    },
    expected: [
      {
        id: "id2",
        name: "Claire Redfield",
        isActive: false,
        points: -3,
      },
      {
        id: "id4",
        name: "Ada Wong",
        isActive: true,
        points: 1,
      },
      {
        id: "id5",
        name: "Sonik",
        isActive: true,
        points: 13,
      },
      {
        id: "id6",
        name: "",
        isActive: false,
        points: 0,
      },
      {
        id: "id7",
        name: null,
        isActive: undefined,
        points: undefined,
      },
      {
        id: "id8",
        name: undefined,
        isActive: null,
        points: null,
      },
    ],
  },
  'Should return data correctly when "IN" number filter passed': {
    data: arrayData,
    filters: {
      field: "points",
      type: DataFilterType.NUMBER,
      operator: DataFilterNumberOperator.IN,
      value: [10, 34, 0, 15, 2],
    },
    expected: [
      {
        id: "id1",
        name: "Chris Redfield",
        isActive: true,
        points: 15,
      },
      {
        id: "id3",
        name: "Ethan Winters",
        isActive: false,
        points: 15,
      },
      {
        id: "id6",
        name: "",
        isActive: false,
        points: 0,
      },
    ],
  },
  'Should return data correctly when "NOT_IN" number filter passed': {
    data: arrayData,
    filters: {
      field: "points",
      type: DataFilterType.NUMBER,
      operator: DataFilterNumberOperator.NOT_IN,
      value: [10, 34, 0, 15, 2],
    },
    expected: [
      {
        id: "id2",
        name: "Claire Redfield",
        isActive: false,
        points: -3,
      },
      {
        id: "id4",
        name: "Ada Wong",
        isActive: true,
        points: 1,
      },
      {
        id: "id5",
        name: "Sonik",
        isActive: true,
        points: 13,
      },
      {
        id: "id7",
        name: null,
        isActive: undefined,
        points: undefined,
      },
      {
        id: "id8",
        name: undefined,
        isActive: null,
        points: null,
      },
    ],
  },
  'Should return data correctly when "LESS" number filter passed': {
    data: arrayData,
    filters: {
      field: "points",
      type: DataFilterType.NUMBER,
      operator: DataFilterNumberOperator.LESS,
      value: 13,
    },
    expected: [
      {
        id: "id2",
        name: "Claire Redfield",
        isActive: false,
        points: -3,
      },
      {
        id: "id4",
        name: "Ada Wong",
        isActive: true,
        points: 1,
      },
      {
        id: "id6",
        name: "",
        isActive: false,
        points: 0,
      },
    ],
  },
  'Should return data correctly when "LESS_OR_EQUAL" number filter passed': {
    data: arrayData,
    filters: {
      field: "points",
      type: DataFilterType.NUMBER,
      operator: DataFilterNumberOperator.LESS_OR_EQUAL,
      value: 13,
    },
    expected: [
      {
        id: "id2",
        name: "Claire Redfield",
        isActive: false,
        points: -3,
      },
      {
        id: "id4",
        name: "Ada Wong",
        isActive: true,
        points: 1,
      },
      {
        id: "id5",
        name: "Sonik",
        isActive: true,
        points: 13,
      },
      {
        id: "id6",
        name: "",
        isActive: false,
        points: 0,
      },
    ],
  },
  'Should return data correctly when "GREATER" number filter passed': {
    data: arrayData,
    filters: {
      field: "points",
      type: DataFilterType.NUMBER,
      operator: DataFilterNumberOperator.GREATER,
      value: 13,
    },
    expected: [
      {
        id: "id1",
        name: "Chris Redfield",
        isActive: true,
        points: 15,
      },
      {
        id: "id3",
        name: "Ethan Winters",
        isActive: false,
        points: 15,
      },
    ],
  },
  'Should return data correctly when "GREATER_OR_EQUAL" number filter passed': {
    data: arrayData,
    filters: {
      field: "points",
      type: DataFilterType.NUMBER,
      operator: DataFilterNumberOperator.GREATER_OR_EQUAL,
      value: 13,
    },
    expected: [
      {
        id: "id1",
        name: "Chris Redfield",
        isActive: true,
        points: 15,
      },
      {
        id: "id3",
        name: "Ethan Winters",
        isActive: false,
        points: 15,
      },
      {
        id: "id5",
        name: "Sonik",
        isActive: true,
        points: 13,
      },
    ],
  },
  'Should return data correctly when "BETWEEN" number filter passed': {
    data: arrayData,
    filters: {
      field: "points",
      type: DataFilterType.NUMBER,
      operator: DataFilterNumberOperator.BETWEEN,
      value: [1, 15],
    },
    expected: [
      {
        id: "id1",
        name: "Chris Redfield",
        isActive: true,
        points: 15,
      },
      {
        id: "id3",
        name: "Ethan Winters",
        isActive: false,
        points: 15,
      },
      {
        id: "id4",
        name: "Ada Wong",
        isActive: true,
        points: 1,
      },
      {
        id: "id5",
        name: "Sonik",
        isActive: true,
        points: 13,
      },
    ],
  },
  'Should return data correctly when "NOT_BETWEEN" number filter passed': {
    data: arrayData,
    filters: {
      field: "points",
      type: DataFilterType.NUMBER,
      operator: DataFilterNumberOperator.NOT_BETWEEN,
      value: [1, 15],
    },
    expected: [
      {
        id: "id2",
        name: "Claire Redfield",
        isActive: false,
        points: -3,
      },
      {
        id: "id6",
        name: "",
        isActive: false,
        points: 0,
      },
      {
        id: "id7",
        name: null,
        isActive: undefined,
        points: undefined,
      },
      {
        id: "id8",
        name: undefined,
        isActive: null,
        points: null,
      },
    ],
  },
  'Should return data correctly when "IS_NULL" number filter passed': {
    data: arrayData,
    filters: {
      field: "points",
      type: DataFilterType.NUMBER,
      operator: DataFilterNumberOperator.IS_NULL,
      value: "",
    },
    expected: [
      {
        id: "id7",
        name: null,
        isActive: undefined,
        points: undefined,
      },
      {
        id: "id8",
        name: undefined,
        isActive: null,
        points: null,
      },
    ],
  },
  'Should return data correctly when "IS_NOT_NULL" number filter passed': {
    data: arrayData,
    filters: {
      field: "points",
      type: DataFilterType.NUMBER,
      operator: DataFilterNumberOperator.IS_NOT_NULL,
      value: "",
    },
    expected: [
      {
        id: "id1",
        name: "Chris Redfield",
        isActive: true,
        points: 15,
      },
      {
        id: "id2",
        name: "Claire Redfield",
        isActive: false,
        points: -3,
      },
      {
        id: "id3",
        name: "Ethan Winters",
        isActive: false,
        points: 15,
      },
      {
        id: "id4",
        name: "Ada Wong",
        isActive: true,
        points: 1,
      },
      {
        id: "id5",
        name: "Sonik",
        isActive: true,
        points: 13,
      },
      {
        id: "id6",
        name: "",
        isActive: false,
        points: 0,
      },
    ],
  },
  'Should return data correctly when "EQUAL" boolean filter passed and value is "true"':
    {
      data: arrayData,
      filters: {
        field: "isActive",
        type: DataFilterType.BOOLEAN,
        operator: DataFilterBooleanOperator.EQUAL,
        value: true,
      },
      expected: [
        {
          id: "id1",
          name: "Chris Redfield",
          isActive: true,
          points: 15,
        },
        {
          id: "id4",
          name: "Ada Wong",
          isActive: true,
          points: 1,
        },
        {
          id: "id5",
          name: "Sonik",
          isActive: true,
          points: 13,
        },
      ],
    },
  'Should return data correctly when "EQUAL" boolean filter passed and value is "false"':
    {
      data: arrayData,
      filters: {
        field: "isActive",
        type: DataFilterType.BOOLEAN,
        operator: DataFilterBooleanOperator.EQUAL,
        value: false,
      },
      expected: [
        {
          id: "id2",
          name: "Claire Redfield",
          isActive: false,
          points: -3,
        },
        {
          id: "id3",
          name: "Ethan Winters",
          isActive: false,
          points: 15,
        },
        {
          id: "id6",
          name: "",
          isActive: false,
          points: 0,
        },
      ],
    },
  'Should return data correctly when "NOT_EQUAL" boolean filter passed and value is "true"':
    {
      data: arrayData,
      filters: {
        field: "isActive",
        type: DataFilterType.BOOLEAN,
        operator: DataFilterBooleanOperator.NOT_EQUAL,
        value: true,
      },
      expected: [
        {
          id: "id2",
          name: "Claire Redfield",
          isActive: false,
          points: -3,
        },
        {
          id: "id3",
          name: "Ethan Winters",
          isActive: false,
          points: 15,
        },
        {
          id: "id6",
          name: "",
          isActive: false,
          points: 0,
        },
        {
          id: "id7",
          name: null,
          isActive: undefined,
          points: undefined,
        },
        {
          id: "id8",
          name: undefined,
          isActive: null,
          points: null,
        },
      ],
    },
  'Should return data correctly when "NOT_EQUAL" boolean filter passed and value is "false"':
    {
      data: arrayData,
      filters: {
        field: "isActive",
        type: DataFilterType.BOOLEAN,
        operator: DataFilterBooleanOperator.NOT_EQUAL,
        value: false,
      },
      expected: [
        {
          id: "id1",
          name: "Chris Redfield",
          isActive: true,
          points: 15,
        },
        {
          id: "id4",
          name: "Ada Wong",
          isActive: true,
          points: 1,
        },
        {
          id: "id5",
          name: "Sonik",
          isActive: true,
          points: 13,
        },
        {
          id: "id7",
          name: null,
          isActive: undefined,
          points: undefined,
        },
        {
          id: "id8",
          name: undefined,
          isActive: null,
          points: null,
        },
      ],
    },
  'Should return data correctly when "IS_NULL" boolean filter passed': {
    data: arrayData,
    filters: {
      field: "isActive",
      type: DataFilterType.BOOLEAN,
      operator: DataFilterBooleanOperator.IS_NULL,
      value: "",
    },
    expected: [
      {
        id: "id7",
        name: null,
        isActive: undefined,
        points: undefined,
      },
      {
        id: "id8",
        name: undefined,
        isActive: null,
        points: null,
      },
    ],
  },
  'Should return data correctly when "IS_NOT_NULL" boolean filter passed': {
    data: arrayData,
    filters: {
      field: "isActive",
      type: DataFilterType.BOOLEAN,
      operator: DataFilterBooleanOperator.IS_NOT_NULL,
      value: "",
    },
    expected: [
      {
        id: "id1",
        name: "Chris Redfield",
        isActive: true,
        points: 15,
      },
      {
        id: "id2",
        name: "Claire Redfield",
        isActive: false,
        points: -3,
      },
      {
        id: "id3",
        name: "Ethan Winters",
        isActive: false,
        points: 15,
      },
      {
        id: "id4",
        name: "Ada Wong",
        isActive: true,
        points: 1,
      },
      {
        id: "id5",
        name: "Sonik",
        isActive: true,
        points: 13,
      },
      {
        id: "id6",
        name: "",
        isActive: false,
        points: 0,
      },
    ],
  },
  'Should return data correctly when two filters passed and condition is "AND"':
    {
      data: arrayData,
      filters: {
        condition: DataFilterCondition.AND,
        rules: [
          {
            field: "points",
            type: DataFilterType.NUMBER,
            operator: DataFilterNumberOperator.BETWEEN,
            value: [1, 15],
          },
          {
            field: "name",
            type: DataFilterType.STRING,
            operator: DataFilterStringOperator.ENDS_WITH,
            value: "Redfield",
          },
        ],
      },
      expected: [
        {
          id: "id1",
          name: "Chris Redfield",
          isActive: true,
          points: 15,
        },
      ],
    },
  'Should return data correctly when two filters passed and condition is "OR"':
    {
      data: arrayData,
      filters: {
        condition: DataFilterCondition.OR,
        rules: [
          {
            field: "points",
            type: DataFilterType.NUMBER,
            operator: DataFilterNumberOperator.BETWEEN,
            value: [1, 15],
          },
          {
            field: "name",
            type: DataFilterType.STRING,
            operator: DataFilterStringOperator.ENDS_WITH,
            value: "Redfield",
          },
        ],
      },
      expected: [
        {
          id: "id1",
          name: "Chris Redfield",
          isActive: true,
          points: 15,
        },
        {
          id: "id2",
          name: "Claire Redfield",
          isActive: false,
          points: -3,
        },
        {
          id: "id3",
          name: "Ethan Winters",
          isActive: false,
          points: 15,
        },
        {
          id: "id4",
          name: "Ada Wong",
          isActive: true,
          points: 1,
        },
        {
          id: "id5",
          name: "Sonik",
          isActive: true,
          points: 13,
        },
      ],
    },
};
const filterDictionaryData: Record<
  string,
  {
    data: Record<string, Record<string, unknown>>;
    filters: IDataFilterRule | IDataFilters;
    expected: Record<string, Record<string, unknown>>;
  }
> = {
  "Should return no data when no data is passed": {
    data: {},
    filters: {
      field: "name",
      type: DataFilterType.STRING,
      operator: DataFilterStringOperator.BEGINS_WITH,
      value: "wer",
    },
    expected: {},
  },
  'Should return data correctly when "EQUAL" string filter passed': {
    data: dictionaryData,
    filters: {
      field: "name",
      type: DataFilterType.STRING,
      operator: DataFilterStringOperator.EQUAL,
      value: "Chris Redfield",
    },
    expected: {
      id1: {
        id: "id1",
        name: "Chris Redfield",
        isActive: true,
        points: 15,
      },
    },
  },
  'Should return data correctly when "NOT_EQUAL" string filter passed': {
    data: dictionaryData,
    filters: {
      field: "name",
      type: DataFilterType.STRING,
      operator: DataFilterStringOperator.NOT_EQUAL,
      value: "Chris Redfield",
    },
    expected: {
      id2: {
        id: "id2",
        name: "Claire Redfield",
        isActive: false,
        points: -3,
      },
      id3: {
        id: "id3",
        name: "Ethan Winters",
        isActive: false,
        points: 15,
      },
      id4: {
        id: "id4",
        name: "Ada Wong",
        isActive: true,
        points: 1,
      },
      id5: {
        id: "id5",
        name: "Sonik",
        isActive: true,
        points: 13,
      },
      id6: {
        id: "id6",
        name: "",
        isActive: false,
        points: 0,
      },
      id7: {
        id: "id7",
        name: null,
        isActive: undefined,
        points: undefined,
      },
      id8: {
        id: "id8",
        name: undefined,
        isActive: null,
        points: null,
      },
    },
  },
  'Should return data correctly when "IN" string filter passed': {
    data: dictionaryData,
    filters: {
      field: "name",
      type: DataFilterType.STRING,
      operator: DataFilterStringOperator.IN,
      value: ["Ada", "Wong", "Claire Redfield", "Ethan Winters", ""],
    },
    expected: {
      id2: {
        id: "id2",
        name: "Claire Redfield",
        isActive: false,
        points: -3,
      },
      id3: {
        id: "id3",
        name: "Ethan Winters",
        isActive: false,
        points: 15,
      },
      id6: {
        id: "id6",
        name: "",
        isActive: false,
        points: 0,
      },
    },
  },
  'Should return data correctly when "NOT_IN" string filter passed': {
    data: dictionaryData,
    filters: {
      field: "name",
      type: DataFilterType.STRING,
      operator: DataFilterStringOperator.NOT_IN,
      value: ["Ada", "Wong", "Claire Redfield", "Ethan Winters", ""],
    },
    expected: {
      id1: {
        id: "id1",
        name: "Chris Redfield",
        isActive: true,
        points: 15,
      },
      id4: {
        id: "id4",
        name: "Ada Wong",
        isActive: true,
        points: 1,
      },
      id5: {
        id: "id5",
        name: "Sonik",
        isActive: true,
        points: 13,
      },
    },
  },
  'Should return data correctly when "BEGINS_WITH" string filter passed': {
    data: dictionaryData,
    filters: {
      field: "name",
      type: DataFilterType.STRING,
      operator: DataFilterStringOperator.BEGINS_WITH,
      value: "Ada",
    },
    expected: {
      id4: {
        id: "id4",
        name: "Ada Wong",
        isActive: true,
        points: 1,
      },
    },
  },
  'Should return data correctly when "NOT_BEGINS_WITH" string filter passed': {
    data: dictionaryData,
    filters: {
      field: "name",
      type: DataFilterType.STRING,
      operator: DataFilterStringOperator.NOT_BEGINS_WITH,
      value: "Ada",
    },
    expected: {
      id1: {
        id: "id1",
        name: "Chris Redfield",
        isActive: true,
        points: 15,
      },
      id2: {
        id: "id2",
        name: "Claire Redfield",
        isActive: false,
        points: -3,
      },
      id3: {
        id: "id3",
        name: "Ethan Winters",
        isActive: false,
        points: 15,
      },
      id5: {
        id: "id5",
        name: "Sonik",
        isActive: true,
        points: 13,
      },
      id6: {
        id: "id6",
        name: "",
        isActive: false,
        points: 0,
      },
      id7: {
        id: "id7",
        name: null,
        isActive: undefined,
        points: undefined,
      },
      id8: {
        id: "id8",
        name: undefined,
        isActive: null,
        points: null,
      },
    },
  },
  'Should return data correctly when "CONTAINS" string filter passed': {
    data: dictionaryData,
    filters: {
      field: "name",
      type: DataFilterType.STRING,
      operator: DataFilterStringOperator.CONTAINS,
      value: "on",
    },
    expected: {
      id4: {
        id: "id4",
        name: "Ada Wong",
        isActive: true,
        points: 1,
      },
      id5: {
        id: "id5",
        name: "Sonik",
        isActive: true,
        points: 13,
      },
    },
  },
  'Should return data correctly when "NOT_CONTAINS" string filter passed': {
    data: dictionaryData,
    filters: {
      field: "name",
      type: DataFilterType.STRING,
      operator: DataFilterStringOperator.NOT_CONTAINS,
      value: "on",
    },
    expected: {
      id1: {
        id: "id1",
        name: "Chris Redfield",
        isActive: true,
        points: 15,
      },
      id2: {
        id: "id2",
        name: "Claire Redfield",
        isActive: false,
        points: -3,
      },
      id3: {
        id: "id3",
        name: "Ethan Winters",
        isActive: false,
        points: 15,
      },
      id6: {
        id: "id6",
        name: "",
        isActive: false,
        points: 0,
      },
      id7: {
        id: "id7",
        name: null,
        isActive: undefined,
        points: undefined,
      },
      id8: {
        id: "id8",
        name: undefined,
        isActive: null,
        points: null,
      },
    },
  },
  'Should return data correctly when "ENDS_WITH" string filter passed': {
    data: dictionaryData,
    filters: {
      field: "name",
      type: DataFilterType.STRING,
      operator: DataFilterStringOperator.ENDS_WITH,
      value: "Redfield",
    },
    expected: {
      id1: {
        id: "id1",
        name: "Chris Redfield",
        isActive: true,
        points: 15,
      },
      id2: {
        id: "id2",
        name: "Claire Redfield",
        isActive: false,
        points: -3,
      },
    },
  },
  'Should return data correctly when "NOT_ENDS_WITH" string filter passed': {
    data: dictionaryData,
    filters: {
      field: "name",
      type: DataFilterType.STRING,
      operator: DataFilterStringOperator.NOT_ENDS_WITH,
      value: "Redfield",
    },
    expected: {
      id3: {
        id: "id3",
        name: "Ethan Winters",
        isActive: false,
        points: 15,
      },
      id4: {
        id: "id4",
        name: "Ada Wong",
        isActive: true,
        points: 1,
      },
      id5: {
        id: "id5",
        name: "Sonik",
        isActive: true,
        points: 13,
      },
      id6: {
        id: "id6",
        name: "",
        isActive: false,
        points: 0,
      },
      id7: {
        id: "id7",
        name: null,
        isActive: undefined,
        points: undefined,
      },
      id8: {
        id: "id8",
        name: undefined,
        isActive: null,
        points: null,
      },
    },
  },
  'Should return data correctly when "IS_EMPTY" string filter passed': {
    data: dictionaryData,
    filters: {
      field: "name",
      type: DataFilterType.STRING,
      operator: DataFilterStringOperator.IS_EMPTY,
      value: "",
    },
    expected: {
      id6: {
        id: "id6",
        name: "",
        isActive: false,
        points: 0,
      },
    },
  },
  'Should return data correctly when "IS_NOT_EMPTY" string filter passed': {
    data: dictionaryData,
    filters: {
      field: "name",
      type: DataFilterType.STRING,
      operator: DataFilterStringOperator.IS_NOT_EMPTY,
      value: "",
    },
    expected: {
      id1: {
        id: "id1",
        name: "Chris Redfield",
        isActive: true,
        points: 15,
      },
      id2: {
        id: "id2",
        name: "Claire Redfield",
        isActive: false,
        points: -3,
      },
      id3: {
        id: "id3",
        name: "Ethan Winters",
        isActive: false,
        points: 15,
      },
      id4: {
        id: "id4",
        name: "Ada Wong",
        isActive: true,
        points: 1,
      },
      id5: {
        id: "id5",
        name: "Sonik",
        isActive: true,
        points: 13,
      },
      id7: {
        id: "id7",
        name: null,
        isActive: undefined,
        points: undefined,
      },
      id8: {
        id: "id8",
        name: undefined,
        isActive: null,
        points: null,
      },
    },
  },
  'Should return data correctly when "IS_NULL" string filter passed': {
    data: dictionaryData,
    filters: {
      field: "name",
      type: DataFilterType.STRING,
      operator: DataFilterStringOperator.IS_NULL,
      value: "",
    },
    expected: {
      id7: {
        id: "id7",
        name: null,
        isActive: undefined,
        points: undefined,
      },
      id8: {
        id: "id8",
        name: undefined,
        isActive: null,
        points: null,
      },
    },
  },
  'Should return data correctly when "IS_NOT_NULL" string filter passed': {
    data: dictionaryData,
    filters: {
      field: "name",
      type: DataFilterType.STRING,
      operator: DataFilterStringOperator.IS_NOT_NULL,
      value: "",
    },
    expected: {
      id1: {
        id: "id1",
        name: "Chris Redfield",
        isActive: true,
        points: 15,
      },
      id2: {
        id: "id2",
        name: "Claire Redfield",
        isActive: false,
        points: -3,
      },
      id3: {
        id: "id3",
        name: "Ethan Winters",
        isActive: false,
        points: 15,
      },
      id4: {
        id: "id4",
        name: "Ada Wong",
        isActive: true,
        points: 1,
      },
      id5: {
        id: "id5",
        name: "Sonik",
        isActive: true,
        points: 13,
      },
      id6: {
        id: "id6",
        name: "",
        isActive: false,
        points: 0,
      },
    },
  },
  'Should return data correctly when "EQUAL" number filter passed': {
    data: dictionaryData,
    filters: {
      field: "points",
      type: DataFilterType.NUMBER,
      operator: DataFilterNumberOperator.EQUAL,
      value: 15,
    },
    expected: {
      id1: {
        id: "id1",
        name: "Chris Redfield",
        isActive: true,
        points: 15,
      },
      id3: {
        id: "id3",
        name: "Ethan Winters",
        isActive: false,
        points: 15,
      },
    },
  },
  'Should return data correctly when "NOT_EQUAL" number filter passed': {
    data: dictionaryData,
    filters: {
      field: "points",
      type: DataFilterType.NUMBER,
      operator: DataFilterNumberOperator.NOT_EQUAL,
      value: 15,
    },
    expected: {
      id2: {
        id: "id2",
        name: "Claire Redfield",
        isActive: false,
        points: -3,
      },
      id4: {
        id: "id4",
        name: "Ada Wong",
        isActive: true,
        points: 1,
      },
      id5: {
        id: "id5",
        name: "Sonik",
        isActive: true,
        points: 13,
      },
      id6: {
        id: "id6",
        name: "",
        isActive: false,
        points: 0,
      },
      id7: {
        id: "id7",
        name: null,
        isActive: undefined,
        points: undefined,
      },
      id8: {
        id: "id8",
        name: undefined,
        isActive: null,
        points: null,
      },
    },
  },
  'Should return data correctly when "IN" number filter passed': {
    data: dictionaryData,
    filters: {
      field: "points",
      type: DataFilterType.NUMBER,
      operator: DataFilterNumberOperator.IN,
      value: [10, 34, 0, 15, 2],
    },
    expected: {
      id1: {
        id: "id1",
        name: "Chris Redfield",
        isActive: true,
        points: 15,
      },
      id3: {
        id: "id3",
        name: "Ethan Winters",
        isActive: false,
        points: 15,
      },
      id6: {
        id: "id6",
        name: "",
        isActive: false,
        points: 0,
      },
    },
  },
  'Should return data correctly when "NOT_IN" number filter passed': {
    data: dictionaryData,
    filters: {
      field: "points",
      type: DataFilterType.NUMBER,
      operator: DataFilterNumberOperator.NOT_IN,
      value: [10, 34, 0, 15, 2],
    },
    expected: {
      id2: {
        id: "id2",
        name: "Claire Redfield",
        isActive: false,
        points: -3,
      },
      id4: {
        id: "id4",
        name: "Ada Wong",
        isActive: true,
        points: 1,
      },
      id5: {
        id: "id5",
        name: "Sonik",
        isActive: true,
        points: 13,
      },
      id7: {
        id: "id7",
        name: null,
        isActive: undefined,
        points: undefined,
      },
      id8: {
        id: "id8",
        name: undefined,
        isActive: null,
        points: null,
      },
    },
  },
  'Should return data correctly when "LESS" number filter passed': {
    data: dictionaryData,
    filters: {
      field: "points",
      type: DataFilterType.NUMBER,
      operator: DataFilterNumberOperator.LESS,
      value: 13,
    },
    expected: {
      id2: {
        id: "id2",
        name: "Claire Redfield",
        isActive: false,
        points: -3,
      },
      id4: {
        id: "id4",
        name: "Ada Wong",
        isActive: true,
        points: 1,
      },
      id6: {
        id: "id6",
        name: "",
        isActive: false,
        points: 0,
      },
    },
  },
  'Should return data correctly when "LESS_OR_EQUAL" number filter passed': {
    data: dictionaryData,
    filters: {
      field: "points",
      type: DataFilterType.NUMBER,
      operator: DataFilterNumberOperator.LESS_OR_EQUAL,
      value: 13,
    },
    expected: {
      id2: {
        id: "id2",
        name: "Claire Redfield",
        isActive: false,
        points: -3,
      },
      id4: {
        id: "id4",
        name: "Ada Wong",
        isActive: true,
        points: 1,
      },
      id5: {
        id: "id5",
        name: "Sonik",
        isActive: true,
        points: 13,
      },
      id6: {
        id: "id6",
        name: "",
        isActive: false,
        points: 0,
      },
    },
  },
  'Should return data correctly when "GREATER" number filter passed': {
    data: dictionaryData,
    filters: {
      field: "points",
      type: DataFilterType.NUMBER,
      operator: DataFilterNumberOperator.GREATER,
      value: 13,
    },
    expected: {
      id1: {
        id: "id1",
        name: "Chris Redfield",
        isActive: true,
        points: 15,
      },
      id3: {
        id: "id3",
        name: "Ethan Winters",
        isActive: false,
        points: 15,
      },
    },
  },
  'Should return data correctly when "GREATER_OR_EQUAL" number filter passed': {
    data: dictionaryData,
    filters: {
      field: "points",
      type: DataFilterType.NUMBER,
      operator: DataFilterNumberOperator.GREATER_OR_EQUAL,
      value: 13,
    },
    expected: {
      id1: {
        id: "id1",
        name: "Chris Redfield",
        isActive: true,
        points: 15,
      },
      id3: {
        id: "id3",
        name: "Ethan Winters",
        isActive: false,
        points: 15,
      },
      id5: {
        id: "id5",
        name: "Sonik",
        isActive: true,
        points: 13,
      },
    },
  },
  'Should return data correctly when "BETWEEN" number filter passed': {
    data: dictionaryData,
    filters: {
      field: "points",
      type: DataFilterType.NUMBER,
      operator: DataFilterNumberOperator.BETWEEN,
      value: [1, 15],
    },
    expected: {
      id1: {
        id: "id1",
        name: "Chris Redfield",
        isActive: true,
        points: 15,
      },
      id3: {
        id: "id3",
        name: "Ethan Winters",
        isActive: false,
        points: 15,
      },
      id4: {
        id: "id4",
        name: "Ada Wong",
        isActive: true,
        points: 1,
      },
      id5: {
        id: "id5",
        name: "Sonik",
        isActive: true,
        points: 13,
      },
    },
  },
  'Should return data correctly when "NOT_BETWEEN" number filter passed': {
    data: dictionaryData,
    filters: {
      field: "points",
      type: DataFilterType.NUMBER,
      operator: DataFilterNumberOperator.NOT_BETWEEN,
      value: [1, 15],
    },
    expected: {
      id2: {
        id: "id2",
        name: "Claire Redfield",
        isActive: false,
        points: -3,
      },
      id6: {
        id: "id6",
        name: "",
        isActive: false,
        points: 0,
      },
      id7: {
        id: "id7",
        name: null,
        isActive: undefined,
        points: undefined,
      },
      id8: {
        id: "id8",
        name: undefined,
        isActive: null,
        points: null,
      },
    },
  },
  'Should return data correctly when "IS_NULL" number filter passed': {
    data: dictionaryData,
    filters: {
      field: "points",
      type: DataFilterType.NUMBER,
      operator: DataFilterNumberOperator.IS_NULL,
      value: "",
    },
    expected: {
      id7: {
        id: "id7",
        name: null,
        isActive: undefined,
        points: undefined,
      },
      id8: {
        id: "id8",
        name: undefined,
        isActive: null,
        points: null,
      },
    },
  },
  'Should return data correctly when "IS_NOT_NULL" number filter passed': {
    data: dictionaryData,
    filters: {
      field: "points",
      type: DataFilterType.NUMBER,
      operator: DataFilterNumberOperator.IS_NOT_NULL,
      value: "",
    },
    expected: {
      id1: {
        id: "id1",
        name: "Chris Redfield",
        isActive: true,
        points: 15,
      },
      id2: {
        id: "id2",
        name: "Claire Redfield",
        isActive: false,
        points: -3,
      },
      id3: {
        id: "id3",
        name: "Ethan Winters",
        isActive: false,
        points: 15,
      },
      id4: {
        id: "id4",
        name: "Ada Wong",
        isActive: true,
        points: 1,
      },
      id5: {
        id: "id5",
        name: "Sonik",
        isActive: true,
        points: 13,
      },
      id6: {
        id: "id6",
        name: "",
        isActive: false,
        points: 0,
      },
    },
  },
  'Should return data correctly when "EQUAL" boolean filter passed and value is "true"':
    {
      data: dictionaryData,
      filters: {
        field: "isActive",
        type: DataFilterType.BOOLEAN,
        operator: DataFilterBooleanOperator.EQUAL,
        value: true,
      },
      expected: {
        id1: {
          id: "id1",
          name: "Chris Redfield",
          isActive: true,
          points: 15,
        },
        id4: {
          id: "id4",
          name: "Ada Wong",
          isActive: true,
          points: 1,
        },
        id5: {
          id: "id5",
          name: "Sonik",
          isActive: true,
          points: 13,
        },
      },
    },
  'Should return data correctly when "EQUAL" boolean filter passed and value is "false"':
    {
      data: dictionaryData,
      filters: {
        field: "isActive",
        type: DataFilterType.BOOLEAN,
        operator: DataFilterBooleanOperator.EQUAL,
        value: false,
      },
      expected: {
        id2: {
          id: "id2",
          name: "Claire Redfield",
          isActive: false,
          points: -3,
        },
        id3: {
          id: "id3",
          name: "Ethan Winters",
          isActive: false,
          points: 15,
        },
        id6: {
          id: "id6",
          name: "",
          isActive: false,
          points: 0,
        },
      },
    },
  'Should return data correctly when "NOT_EQUAL" boolean filter passed and value is "true"':
    {
      data: dictionaryData,
      filters: {
        field: "isActive",
        type: DataFilterType.BOOLEAN,
        operator: DataFilterBooleanOperator.NOT_EQUAL,
        value: true,
      },
      expected: {
        id2: {
          id: "id2",
          name: "Claire Redfield",
          isActive: false,
          points: -3,
        },
        id3: {
          id: "id3",
          name: "Ethan Winters",
          isActive: false,
          points: 15,
        },
        id6: {
          id: "id6",
          name: "",
          isActive: false,
          points: 0,
        },
        id7: {
          id: "id7",
          name: null,
          isActive: undefined,
          points: undefined,
        },
        id8: {
          id: "id8",
          name: undefined,
          isActive: null,
          points: null,
        },
      },
    },
  'Should return data correctly when "NOT_EQUAL" boolean filter passed and value is "false"':
    {
      data: dictionaryData,
      filters: {
        field: "isActive",
        type: DataFilterType.BOOLEAN,
        operator: DataFilterBooleanOperator.NOT_EQUAL,
        value: false,
      },
      expected: {
        id1: {
          id: "id1",
          name: "Chris Redfield",
          isActive: true,
          points: 15,
        },
        id4: {
          id: "id4",
          name: "Ada Wong",
          isActive: true,
          points: 1,
        },
        id5: {
          id: "id5",
          name: "Sonik",
          isActive: true,
          points: 13,
        },
        id7: {
          id: "id7",
          name: null,
          isActive: undefined,
          points: undefined,
        },
        id8: {
          id: "id8",
          name: undefined,
          isActive: null,
          points: null,
        },
      },
    },
  'Should return data correctly when "IS_NULL" boolean filter passed': {
    data: dictionaryData,
    filters: {
      field: "isActive",
      type: DataFilterType.BOOLEAN,
      operator: DataFilterBooleanOperator.IS_NULL,
      value: "",
    },
    expected: {
      id7: {
        id: "id7",
        name: null,
        isActive: undefined,
        points: undefined,
      },
      id8: {
        id: "id8",
        name: undefined,
        isActive: null,
        points: null,
      },
    },
  },
  'Should return data correctly when "IS_NOT_NULL" boolean filter passed': {
    data: dictionaryData,
    filters: {
      field: "isActive",
      type: DataFilterType.BOOLEAN,
      operator: DataFilterBooleanOperator.IS_NOT_NULL,
      value: "",
    },
    expected: {
      id1: {
        id: "id1",
        name: "Chris Redfield",
        isActive: true,
        points: 15,
      },
      id2: {
        id: "id2",
        name: "Claire Redfield",
        isActive: false,
        points: -3,
      },
      id3: {
        id: "id3",
        name: "Ethan Winters",
        isActive: false,
        points: 15,
      },
      id4: {
        id: "id4",
        name: "Ada Wong",
        isActive: true,
        points: 1,
      },
      id5: {
        id: "id5",
        name: "Sonik",
        isActive: true,
        points: 13,
      },
      id6: {
        id: "id6",
        name: "",
        isActive: false,
        points: 0,
      },
    },
  },
  'Should return data correctly when two filters passed and condition is "AND"':
    {
      data: dictionaryData,
      filters: {
        condition: DataFilterCondition.AND,
        rules: [
          {
            field: "points",
            type: DataFilterType.NUMBER,
            operator: DataFilterNumberOperator.BETWEEN,
            value: [1, 15],
          },
          {
            field: "name",
            type: DataFilterType.STRING,
            operator: DataFilterStringOperator.ENDS_WITH,
            value: "Redfield",
          },
        ],
      },
      expected: {
        id1: {
          id: "id1",
          name: "Chris Redfield",
          isActive: true,
          points: 15,
        },
      },
    },
  'Should return data correctly when two filters passed and condition is "OR"':
    {
      data: dictionaryData,
      filters: {
        condition: DataFilterCondition.OR,
        rules: [
          {
            field: "points",
            type: DataFilterType.NUMBER,
            operator: DataFilterNumberOperator.BETWEEN,
            value: [1, 15],
          },
          {
            field: "name",
            type: DataFilterType.STRING,
            operator: DataFilterStringOperator.ENDS_WITH,
            value: "Redfield",
          },
        ],
      },
      expected: {
        id1: {
          id: "id1",
          name: "Chris Redfield",
          isActive: true,
          points: 15,
        },
        id2: {
          id: "id2",
          name: "Claire Redfield",
          isActive: false,
          points: -3,
        },
        id3: {
          id: "id3",
          name: "Ethan Winters",
          isActive: false,
          points: 15,
        },
        id4: {
          id: "id4",
          name: "Ada Wong",
          isActive: true,
          points: 1,
        },
        id5: {
          id: "id5",
          name: "Sonik",
          isActive: true,
          points: 13,
        },
      },
    },
};

describe("DataFilter Unit Tests", () => {
  describe("filterArray function", () => {
    Object.entries(filterArrayData).forEach(([testName, testData]) => {
      it(testName, () => {
        expect(dataFilter.filterArray(testData.data, testData.filters)).to.eql(
          testData.expected
        );
      });
    });
  });

  describe("filterDictionary function", () => {
    Object.entries(filterDictionaryData).forEach(([testName, testData]) => {
      it(testName, () => {
        expect(
          dataFilter.filterDictionary(testData.data, testData.filters)
        ).to.eql(testData.expected);
      });
    });
  });
});
