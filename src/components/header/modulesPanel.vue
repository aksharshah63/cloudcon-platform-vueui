<script lang="ts">
import { defineComponent, PropType } from "vue";
import { IModuleOption } from "../../store/modules/upvise.d";
import { useRouter } from "vue-router";
import SquareIconButton from "./SquareIconButton.vue";

export const ModulesPanel = /*#__PURE__*/ defineComponent({
  name: "ModulesPanel",
  components: {
    SquareIconButton,
  },
  props: {
    modules: {
      type: Array as PropType<IModuleOption[]>,
      required: true,
    },
  },
  setup(props, { emit }) {
    const router = useRouter();

    function updateSelectedModule(option: IModuleOption) {
      emit("updateSelectedModule", option);
    }

    function closeModulesOverlayPanel() {
      emit("closeModulesOverlayPanel");
    }

    function navigateToModule(option: IModuleOption) {
      console.log(option);
      router.push({
        path: option.path,
      });

      updateSelectedModule(option);
      closeModulesOverlayPanel();
    }

    return {
      props,
      navigateToModule,
      Hamburgermenu: [
        {
          id: "entities_id",
          path: "/people",
          name: "Entitites",
          visible: true,
          menuItems: [
            {
              id: "1",
              path: "/people",
              name: "People",
              icon: "bell",
              visible: true,
            },
            {
              id: "2",
              path: "/plant",
              name: "Plant",
              icon: "bell",
              visible: true,
            },
            {
              id: "3",
              path: "/job",
              name: "Jobs",
              icon: "bell",
              visible: true,
            },
            {
              id: "4",
              path: "/workOrder",
              name: "Work Orders",
              icon: "bell",
              visible: true,
            },
            {
              id: "5",
              path: "/company",
              name: "Companies",
              icon: "bell",
              visible: true,
            },
          ],
        },
        {
          id: "forms_id",
          path: "/",
          name: "Forms",
          visible: true,
          menuItems: [
            {
              id: "6",
              path: "/formTemplates",
              name: "Form Templates",
              icon: "bell",
              visible: true,
            },
            {
              id: "7",
              path: "/",
              name: "Forms",
              icon: "bell",
              visible: true,
            },
            {
              id: "8",
              path: "/",
              name: "Fields",
              icon: "bell",
              visible: true,
            },
          ],
        },
        {
          id: "",
          path: "",
          name: "",
          visible: "",
          menuItems: [
            {
              id: "9",
              path: "/",
              name: "DAR",
              icon: "bell",
              visible: true,
            },
            {
              id: "10",
              path: "/",
              name: "Planner",
              icon: "bell",
              visible: true,
            },
            {
              id: "11",
              path: "/",
              name: "Payroll",
              icon: "bell",
              visible: true,
            },
          ],
        },
      ],
    };
  },
});
export default ModulesPanel;
</script>

<template>
  <div class="p-d-flex p-flex-column modules-panel">
    <template v-for="option in Hamburgermenu" :key="option.id">
      <div v-if="option.visible || option.visible == ''" class="is-clickable">
        <div class="module-wrap">
          <h6>{{ option.name }}</h6>
          <ul>
            <li v-for="item in option.menuItems" :key="item">
              <router-link :to="item.path">
                <SquareIconButton
                  :iconName="item.icon"
                  class="md-icon-link"
                  @click="navigateToModule(item)"
                >
                  <template v-slot:iconWithName>
                    <div>{{ item.name }}</div>
                  </template>
                </SquareIconButton>
              </router-link>
            </li>
          </ul>
        </div>
      </div>
    </template>
  </div>
</template>

<style lang="scss">
.modules-panel {
  .module-wrap {
    border-bottom: 1px solid $grey5;
    padding-bottom: 15px;
    margin-bottom: 15px;
    h6 {
      font-weight: 600;
      font-size: 12px;
      line-height: 120%;
      color: #999999;
      margin-bottom: 8px;
    }
    ul {
      li {
        a.menu-icon-link {
          font-weight: 600;
          font-size: 14px;
          line-height: 120%;
          padding: 8px;
          background: transparent;
          color: var(--grey-1400);
          border-radius: 10px;
          display: flex;
          align-items: center;
          transition: all 0.1s ease-in-out;
          -webkit-transition: all 0.1s ease-in-out;
          -moz-transition: all 0.1s ease-in-out;
          -ms-transition: all 0.1s ease-in-out;
          -o-transition: all 0.1s ease-in-out;

          &:hover {
            background-color: var(--grey-1700);
            color: var(--grey-1400);
          }
          &.md-icon-link {
            .icon-wrap {
              background-color: var(--primary-colour);
              color: $white;
              margin-right: 10px;
            }
          }
        }
      }
    }
  }
}
</style>
