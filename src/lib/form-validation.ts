import type { FormEvent, InvalidEvent } from "react";
import {
  CATEGORY_MAX_LENGTH,
  DESCRIPTION_MAX_LENGTH,
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PHONE_MAX_LENGTH,
  PHONE_MIN_LENGTH,
  UNIT_MAX_LENGTH,
} from "@/lib/field-rules";

type ValidatableField = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

function getSpanishValidationMessage(field: ValidatableField) {
  const { validity, name, type } = field;

  if (validity.valueMissing) {
    return "Este campo es obligatorio.";
  }

  if (validity.typeMismatch || validity.badInput) {
    return "Ingresa un valor válido.";
  }

  if (validity.rangeUnderflow) {
    return "Ingresa un valor mayor o igual al mínimo permitido.";
  }

  if (validity.rangeOverflow) {
    return "Ingresa un valor menor o igual al máximo permitido.";
  }

  if (validity.stepMismatch) {
    return "Ingresa un valor válido para este campo.";
  }

  if (validity.patternMismatch) {
    return type === "tel"
      ? "Ingresa un teléfono válido usando solo números y símbolos permitidos."
      : "El formato ingresado no es válido.";
  }

  if (validity.tooShort) {
    if (name.toLowerCase().includes("phone")) {
      return `El teléfono debe tener al menos ${PHONE_MIN_LENGTH} caracteres.`;
    }

    if (type === "password") {
      return `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`;
    }

    if (name.toLowerCase().includes("name")) {
      return `El texto debe tener al menos ${NAME_MIN_LENGTH} caracteres.`;
    }

    return "El valor ingresado es demasiado corto.";
  }

  if (validity.tooLong) {
    if (name.toLowerCase().includes("phone")) {
      return `El teléfono no puede exceder ${PHONE_MAX_LENGTH} caracteres.`;
    }

    if (type === "password") {
      return `La contraseña no puede exceder ${PASSWORD_MAX_LENGTH} caracteres.`;
    }

    if (name.toLowerCase().includes("description")) {
      return `La descripción no puede exceder ${DESCRIPTION_MAX_LENGTH} caracteres.`;
    }

    if (name.toLowerCase().includes("category")) {
      return `La categoría no puede exceder ${CATEGORY_MAX_LENGTH} caracteres.`;
    }

    if (name.toLowerCase().includes("unit")) {
      return `La unidad no puede exceder ${UNIT_MAX_LENGTH} caracteres.`;
    }

    if (name.toLowerCase().includes("name")) {
      return `El texto no puede exceder ${NAME_MAX_LENGTH} caracteres.`;
    }

    return "El valor ingresado es demasiado largo.";
  }

  return "Revisa este campo.";
}

export function setSpanishValidationMessage(event: InvalidEvent<ValidatableField>) {
  const field = event.currentTarget;
  field.setCustomValidity(getSpanishValidationMessage(field));
}

export function clearSpanishValidationMessage(event: FormEvent<ValidatableField>) {
  event.currentTarget.setCustomValidity("");
}

export function validateSpanishOnInput(event: FormEvent<ValidatableField>) {
  const field = event.currentTarget;
  field.setCustomValidity("");

  if (!field.validity.valid) {
    field.setCustomValidity(getSpanishValidationMessage(field));
  }
}
