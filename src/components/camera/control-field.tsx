import { FieldRowDs } from "../../design-system/field-row-ds";
import { SegmentedDs } from "../../design-system/segmented-ds";
import { SliderDs } from "../../design-system/slider-ds";
import { SwitchDs } from "../../design-system/switch-ds";
import { ToggleRowDs } from "../../design-system/toggle-row-ds";
import { ControlFormatHelper } from "../../helpers/control-format-helper";
import { ControlSliderHelper } from "../../helpers/control-slider-helper";
import { ControlStateHelper } from "../../helpers/control-state-helper";
import { Messages } from "../../i18n/messages";
import type { ControlState } from "../../models/control-state";
import { useCameraStore } from "../../stores/camera-store";

interface ControlFieldProps {
  control: ControlState;
}

export function ControlField({ control }: ControlFieldProps) {
  const changeControl = useCameraStore((state) => state.changeControl);
  const label = ControlFormatHelper.label(control.id);
  const disabled = !ControlStateHelper.isEditable(control);

  if (control.controlType === "toggle") {
    return (
      <ToggleRowDs label={label} disabled={disabled}>
        <SwitchDs
          checked={control.value !== 0}
          disabled={disabled}
          ariaLabel={label}
          onChange={(checked) => changeControl(control.id, checked ? 1 : 0)}
        />
      </ToggleRowDs>
    );
  }

  return (
    <FieldRowDs
      label={label}
      valueText={
        control.controlType === "range" ? ControlFormatHelper.valueText(control) : undefined
      }
      resetLabel={Messages.resetControl}
      canReset={!ControlStateHelper.isAtDefault(control)}
      disabled={disabled}
      onReset={() => changeControl(control.id, control.defaultValue ?? control.value)}
    >
      {control.controlType === "range" ? (
        <SliderDs
          {...ControlSliderHelper.range(control)}
          disabled={disabled}
          ariaLabel={label}
          onChange={(sliderValue) =>
            changeControl(control.id, ControlSliderHelper.controlValue(control, sliderValue))
          }
        />
      ) : (
        <SegmentedDs
          options={control.options.map((value) => ({
            value,
            label: ControlFormatHelper.optionLabel(control.id, value),
          }))}
          value={control.value}
          disabled={disabled}
          ariaLabel={label}
          onChange={(value) => changeControl(control.id, value)}
        />
      )}
    </FieldRowDs>
  );
}
