"use client";

import { createFormHook } from "@tanstack/react-form";

import { fieldContext, formContext } from "@/components/form/form-context";
import { FormInput } from "@/components/form/form-input";
import { FormPasswordInput } from "@/components/form/form-password-input";
import { FormSubmitButton } from "@/components/form/form-submit-button";

export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    Input: FormInput,
    PasswordInput: FormPasswordInput,
  },
  formComponents: {
    SubmitButton: FormSubmitButton,
  },
});
