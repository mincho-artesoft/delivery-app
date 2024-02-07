import { ValidationErrors } from '@angular/forms';
import { BaseControl } from '../base-control';
import moment from 'moment';

interface WarehouseProduct {
  product: string;
  quantity: number;
  validTo: string;
}

export function productAvailabilityValidator(control: BaseControl): ValidationErrors | null {
  const rawWarehouseData = control.parent && control.parent['externalServiceData'];
  const recipeProducts = control.parent?.get('products')?.value;
  const quantityOrdered = parseInt(control.value, 10);
  const warehouseData: any = collectValidProducts(rawWarehouseData || []);
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


function collectValidProducts(warehouseData: WarehouseProduct[]): any {
  const validProducts: any = [];

  warehouseData.forEach(product => {
    const isValidExpiration = moment().isBefore(moment(product.validTo));
    if (isValidExpiration) {
      if (validProducts[product.product]) {
        validProducts[product.product].quantity += product.quantity;
      } else {
        validProducts[product.product] = product;
      }
    }
  });
  return Object.values(validProducts);
}
