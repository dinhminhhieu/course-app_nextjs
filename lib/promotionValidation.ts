import { ITypePromotion } from "@/types/promotion";
import { ITypeOrderProduct } from "@/types/order";

interface ValidationResult {
  isValid: boolean;
  message?: string;
}

interface OrderData {
  branch: string;
  paymentMethod: string;
  totalPrice: number;
  products: ITypeOrderProduct[];
}

export const promotionValidation = (
  promotion: ITypePromotion,
  orderData: OrderData
): ValidationResult => {
  // B1: Kiểm tra các apply conditions
  // Kiểm tra branch
  // Kiểm tra giỏ hàng đang có sản phẩm hay không

  if (orderData.products.length === 0) {
    return {
      isValid: false,
      message: "Không có sản phẩm trong giỏ hàng",
    };
  }

  if (!promotion.applyAllBranch) {
    const currentBranch = orderData.branch;
    const isValidBranch = promotion.applyBranchs.includes(currentBranch);

    if (!isValidBranch) {
      return {
        isValid: false,
        message: "Khuyến mãi không được áp dụng tại chi nhánh này",
      };
    }
  }

  // Kiểm tra payment method
  if (!promotion.applyAllPayment) {
    const currentPaymentMethod = orderData.paymentMethod;
    const isValidPayment =
      promotion.applyPayments.includes(currentPaymentMethod);

    if (!isValidPayment) {
      return {
        isValid: false,
        message: "Khuyến mãi không được áp dụng cho phương thức thanh toán này",
      };
    }
  }

  // B2: Kiểm tra discount conditions
  if (promotion.type === "DISCOUNT" && promotion.discount) {
    const { discount } = promotion;

    // TH1: ORDER discount - kiểm tra priceFrom và priceTo
    if (discount.typeDiscount === "ORDER") {
      const { orderDiscounts } = discount;

      if (orderDiscounts && orderDiscounts.length > 0) {
        let isValidOrderAmount = false;
        let validRange: { priceFrom: number; priceTo: number } | null = null;

        for (const orderDiscount of orderDiscounts) {
          const { priceFrom, priceTo } = orderDiscount;

          if (
            orderData.totalPrice >= priceFrom &&
            orderData.totalPrice <= priceTo
          ) {
            isValidOrderAmount = true;
            break;
          }

          // Lưu range đầu tiên để show message
          if (!validRange) {
            validRange = { priceFrom, priceTo };
          }
        }

        if (!isValidOrderAmount && validRange) {
          const fromFormatted = validRange.priceFrom.toLocaleString("vi-VN");
          const toFormatted = validRange.priceTo.toLocaleString("vi-VN");

          return {
            isValid: false,
            message: `Khuyến mãi chỉ áp dụng cho đơn hàng từ ${fromFormatted}đ đến ${toFormatted}đ`,
          };
        }
      }
    }

    // TH2: PRODUCT discount - kiểm tra sản phẩm và số lượng
    if (discount.typeDiscount === "PRODUCT") {
      const { productDiscounts } = discount;

      if (productDiscounts && productDiscounts.length > 0) {
        // Chỉ cần ít nhất 1 productDiscount pass validation là đủ (OR logic)
        let hasValidProductDiscount = false;
        let lastErrorMessage = "";

        for (const productDiscount of productDiscounts) {
          const { purchases, quantityPurchase } = productDiscount;

          let hasMatchingProduct = false;
          let totalQuantityOfMatchingProducts = 0;
          let matchingProductName = "";

          // Kiểm tra TẤT CẢ purchases, không break sớm
          for (const purchase of purchases) {
            // Tìm sản phẩm trong order có ID trùng với purchase._id
            const matchingOrderProducts = orderData.products.filter(
              (orderProduct) => orderProduct.id === purchase._id
            );

            if (matchingOrderProducts.length > 0) {
              hasMatchingProduct = true;
              matchingProductName = purchase.name;
              totalQuantityOfMatchingProducts += matchingOrderProducts.reduce(
                (sum, product) => sum + product.quantity,
                0
              );
            }
          }

          console.log("hasMatchingProduct", hasMatchingProduct);
          console.log("totalQuantityOfMatchingProducts", totalQuantityOfMatchingProducts);
          console.log("quantityPurchase", quantityPurchase);
          console.log("matchingProductName", matchingProductName);

          // Kiểm tra điều kiện cho productDiscount này
          if (hasMatchingProduct && totalQuantityOfMatchingProducts >= quantityPurchase) {
            hasValidProductDiscount = true;
            break; // Đã tìm thấy 1 productDiscount hợp lệ, thoát vòng lặp
          }

          // Lưu error message cho trường hợp không có productDiscount nào hợp lệ
          if (!hasMatchingProduct) {
            lastErrorMessage = "Khuyến mãi không áp dụng cho sản phẩm này";
          } else if (totalQuantityOfMatchingProducts < quantityPurchase) {
            lastErrorMessage = `Sản phẩm ${matchingProductName} không đáp ứng điều kiện (cần tối thiểu ${quantityPurchase} sản phẩm)`;
          }
        }

        // Nếu không có productDiscount nào hợp lệ
        if (!hasValidProductDiscount) {
          return {
            isValid: false,
            message: lastErrorMessage || "Khuyến mãi không áp dụng cho sản phẩm này",
          };
        }
      }
    }

    // TH3: PRODUCT_NUMBER discount - kiểm tra sản phẩm và số lượng trong khoảng
    if (discount.typeDiscount === "PRODUCT_NUMBER") {
      const { numProductDiscounts } = discount;

      if (numProductDiscounts && numProductDiscounts.length > 0) {
        // Tương tự logic OR cho PRODUCT_NUMBER
        let hasValidNumProductDiscount = false;
        let lastErrorMessage = "";

        for (const numProductDiscount of numProductDiscounts) {
          const { purchases, quantityFrom, quantityTo } = numProductDiscount;

          let hasMatchingProductNumberDiscount = false;
          let totalQuantityOfMatchingProducts = 0;
          let matchingProductName = "";

          // Kiểm tra TẤT CẢ purchases
          for (const purchase of purchases) {
            const matchingOrderProducts = orderData.products.filter(
              (orderProduct) => orderProduct.id === purchase._id
            );

            if (matchingOrderProducts.length > 0) {
              hasMatchingProductNumberDiscount = true;
              matchingProductName = purchase.name;
              totalQuantityOfMatchingProducts += matchingOrderProducts.reduce(
                (sum, product) => sum + product.quantity,
                0
              );
            }
          }

          // Kiểm tra điều kiện cho numProductDiscount này
          if (
            hasMatchingProductNumberDiscount &&
            totalQuantityOfMatchingProducts >= quantityFrom &&
            totalQuantityOfMatchingProducts <= quantityTo
          ) {
            hasValidNumProductDiscount = true;
            break;
          }

          // Lưu error message
          if (!hasMatchingProductNumberDiscount) {
            lastErrorMessage = "Khuyến mãi không áp dụng cho sản phẩm này";
          } else if (
            totalQuantityOfMatchingProducts < quantityFrom ||
            totalQuantityOfMatchingProducts > quantityTo
          ) {
            lastErrorMessage = `Sản phẩm ${matchingProductName} không đáp ứng điều kiện (cần từ ${quantityFrom} đến ${quantityTo} sản phẩm)`;
          }
        }

        if (!hasValidNumProductDiscount) {
          return {
            isValid: false,
            message: lastErrorMessage || "Khuyến mãi không áp dụng cho sản phẩm này",
          };
        }
      }
    }
  }

  // B3: Kiểm tra donate conditions nếu có
  if (promotion.type === "DONATE" && promotion.donate) {
    const { donate } = promotion;

    // TH1: ORDER donate - kiểm tra price tối thiểu
    if (donate.typeDonate === "ORDER") {
      const { orderDonates } = donate;

      if (orderDonates && orderDonates.length > 0) {
        for (const orderDonate of orderDonates) {
          const { price, product } = orderDonate;

          if (orderData.totalPrice < price) {
            const priceFormatted = price.toLocaleString("vi-VN");
            return {
              isValid: false,
              message: `Không đủ điều kiện nhận quà (cần đơn hàng tối thiểu ${priceFormatted}đ)`,
            };
          }
        }
      }
    }

    // TH2: PRODUCT donate - kiểm tra sản phẩm điều kiện và số lượng
    if (donate.typeDonate === "PRODUCT") {
      const { productDonates } = donate;

      if (productDonates && productDonates.length > 0) {
        // Logic OR cho PRODUCT donate
        let hasValidProductDonate = false;
        let lastErrorMessage = "";

        for (const productDonate of productDonates) {
          const { purchases, quantityPurchase, donates } = productDonate;

          let hasMatchingProductDonate = false;
          let totalQuantityOfMatchingProducts = 0;
          let matchingProductName = "";
          let donateProductName = "";

          // Lấy tên sản phẩm được tặng để hiển thị
          if (donates && donates.length > 0) {
            donateProductName = donates[0].name;
          }

          // Kiểm tra TẤT CẢ purchases
          for (const purchase of purchases) {
            const matchingOrderProducts = orderData.products.filter(
              (orderProduct) => orderProduct.id === purchase._id
            );

            if (matchingOrderProducts.length > 0) {
              hasMatchingProductDonate = true;
              matchingProductName = purchase.name;
              totalQuantityOfMatchingProducts += matchingOrderProducts.reduce(
                (sum, product) => sum + product.quantity,
                0
              );
            }
          }

          // Kiểm tra điều kiện cho productDonate này
          if (hasMatchingProductDonate && totalQuantityOfMatchingProducts >= quantityPurchase) {
            hasValidProductDonate = true;
            break;
          }

          // Lưu error message
          if (!hasMatchingProductDonate) {
            lastErrorMessage = "Không đủ điều kiện nhận quà (không có sản phẩm điều kiện)";
          } else if (totalQuantityOfMatchingProducts < quantityPurchase) {
            lastErrorMessage = `Không đủ điều kiện nhận quà ${donateProductName} (cần mua tối thiểu ${quantityPurchase} ${matchingProductName})`;
          }
        }

        if (!hasValidProductDonate) {
          return {
            isValid: false,
            message: lastErrorMessage || "Không đủ điều kiện nhận quà",
          };
        }
      }
    }
  }

  return {
    isValid: true,
  };
};