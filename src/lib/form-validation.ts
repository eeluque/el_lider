import type { FormEvent, InvalidEvent } from "react";

type ValidatableField = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

export function setSpanishValidationMessage(event: InvalidEvent<ValidatableField>) {
  const field = event.currentTarget;
  const { validity } = field;

  let message = "Revisa este campo.";

  if (validity.valueMissing) {
    message = "Este campo es obligatorio.";
  } else if (validity.typeMismatch || validity.badInput) {
    message = "Ingresa un valor válido.";
  } else if (validity.rangeUnderflow) {
    message = "Ingresa un valor mayor o igual al mínimo permitido.";
  } else if (validity.rangeOverflow) {
    message = "Ingresa un valor menor o igual al máximo permitido.";
  } else if (validity.stepMismatch) {
    message = "Ingresa un valor válido para este campo.";
  } else if (validity.patternMismatch) {
    message = "El formato ingresado no es válido.";
  } else if (validity.tooShort) {
    message = "El valor ingresado es demasiado corto.";
  } else if (validity.tooLong) {
    message = "El valor ingresado es demasiado largo.";
  }

  field.setCustomValidity(message);
}

export function clearSpanishValidationMessage(event: FormEvent<ValidatableField>) {
  event.currentTarget.setCustomValidity("");
}
