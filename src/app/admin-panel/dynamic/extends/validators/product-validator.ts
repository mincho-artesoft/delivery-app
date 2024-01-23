import { ValidationErrors } from '@angular/forms';
import { BaseControl } from '../base-control';

export function productAvailabilityValidator(control: BaseControl): ValidationErrors | null {
  const warehouseData = control.parent && control.parent['externalServiceData'];
  const recipeProducts = control.parent?.get('products')?.value;
  const quantityOrdered = parseInt(control.value, 10);

  if (!warehouseData || !recipeProducts || isNaN(quantityOrdered)) {
    return { 'productUnavailable': 'Invalid or missing data for validation' };
  }

  let errors: ValidationErrors = {};

  for (let recipeProduct of recipeProducts) {
    const warehouseProduct = warehouseData.find(product => product.product === recipeProduct.product);

    if (!warehouseProduct) {
      errors[`${recipeProduct.product}NotAvailable`] = `Product ${recipeProduct.product} is not available in the warehouse`;
      continue;
    }

    const requiredQuantity = parseFloat(recipeProduct.quantity) * quantityOrdered;
    if (parseFloat(warehouseProduct.quantity) < requiredQuantity) {
      errors[`${recipeProduct.product}Insufficient`] = `Insufficient quantity for product ${recipeProduct.product}`;
    }
  }

  return Object.keys(errors).length > 0 ? errors : null;
}
