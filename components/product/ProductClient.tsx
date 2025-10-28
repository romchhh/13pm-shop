"use client";

import { useAppContext } from "@/lib/GeneralProvider";
import { useState, useEffect } from "react";
import { useBasket } from "@/lib/BasketProvider";
import Image from "next/image";
import Alert from "@/components/shared/Alert";
import { getFirstProductImage } from "@/lib/getFirstProductImage";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { useRouter } from "next/navigation";
import "swiper/css";
import "swiper/css/navigation";

// Add custom styles for smooth transitions
const swiperStyles = `
  .swiper {
    touch-action: pan-y pinch-zoom;
    will-change: transform;
    -webkit-overflow-scrolling: touch;
    overflow: hidden;
  }
  .swiper-wrapper {
    transition-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }
  .swiper-slide {
    transition-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
  }
  .swiper-slide-transition-allow {
    will-change: transform;
  }
  .swiper-slide img,
  .swiper-slide video {
    -webkit-user-select: none;
    user-select: none;
    -webkit-touch-callout: none;
    -webkit-tap-highlight-color: transparent;
  }
`;
import { Swiper as SwiperType } from "swiper";

const SIZE_MAP: Record<string, string> = {
  "1": "XL",
  "2": "L",
  "3": "M",
  "4": "S",
  "5": "XS",
};

interface ProductClientProps {
  product: {
    id: number;
    name: string;
    price: number;
    old_price?: number;
    discount_percentage?: number;
    description?: string;
    media?: { url: string; type: string }[];
    sizes?: { size: string; stock: string }[];
    colors?: { label: string; hex?: string | null }[];
    fabric_composition?: string;
    has_lining?: boolean;
    lining_description?: string;
  };
}

interface RelatedProduct {
  id: number;
  name: string;
  first_color: { label: string; hex?: string | null } | null;
}

export default function ProductClient({ product: initialProduct }: ProductClientProps) {
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const quantity = 1;
  const { isDark } = useAppContext();
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [product, setProduct] = useState(initialProduct);
  const [isLoading, setIsLoading] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  // Use basket hook - component is client-side only with 'use client'
  const { addItem } = useBasket();

  // Inject custom styles for smoother transitions
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = swiperStyles;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, [swiperStyles]);

  const [showToast, setShowToast] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<
    "success" | "error" | "warning" | "info"
  >("info");
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  // Auto-select first color if available
  useEffect(() => {
    if (product?.colors && product.colors.length > 0 && !selectedColor) {
      setSelectedColor(product.colors[0].label);
    }
  }, [product, selectedColor]);

  // Fetch related products with same name
  useEffect(() => {
    async function fetchRelatedProducts() {
      try {
        const response = await fetch(
          `/api/products/related-colors?name=${encodeURIComponent(product.name)}`
        );
        if (response.ok) {
          const data: RelatedProduct[] = await response.json();
          // Filter out current product
          const filtered = data.filter((p) => p.id !== product.id);
          setRelatedProducts(filtered);
        } else {
          // Silently fail - related products are optional
          console.warn("Could not fetch related products:", response.statusText);
        }
      } catch (error) {
        // Silently fail - related products are optional and shouldn't break the page
        console.warn("Error fetching related products (non-critical):", error);
      }
    }
    
    if (product?.name) {
      fetchRelatedProducts();
    }
  }, [product.name, product.id]);

  // Handle color variant change
  const handleColorVariantChange = async (productId: number) => {
    if (productId === product.id) return;
    
    setIsLoading(true);
    setActiveImageIndex(0);
    
    try {
      const response = await fetch(`/api/products/${productId}`);
      if (response.ok) {
        const newProduct = await response.json();
        
        // Update URL without reload
        window.history.pushState(null, '', `/product/${productId}`);
        
        // Update product state with smooth transition
        setTimeout(() => {
          setProduct(newProduct);
          setSelectedSize(null); // Reset size selection
          
          // Auto-select first color if available
          if (newProduct.colors && newProduct.colors.length > 0) {
            setSelectedColor(newProduct.colors[0].label);
          } else {
            setSelectedColor(null);
          }
          
          setIsLoading(false);
        }, 100);
      } else {
        console.error("Failed to fetch product:", response.statusText);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      setIsLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      setAlertMessage("Оберіть розмір");
      setAlertType("warning");
      setTimeout(() => setAlertMessage(null), 3000);
      return;
    }
    if (product?.colors && product.colors.length > 0 && !selectedColor) {
      setAlertMessage("Оберіть колір");
      setAlertType("warning");
      setTimeout(() => setAlertMessage(null), 3000);
      return;
    }
    if (!product) {
      setAlertMessage("Товар не завантажений");
      setAlertType("error");
      setTimeout(() => setAlertMessage(null), 3000);
      return;
    }
    if (!addItem) {
      setAlertMessage("Кошик недоступний. Спробуйте оновити сторінку.");
      setAlertType("error");
      setTimeout(() => setAlertMessage(null), 3000);
      return;
    }
    const media = product.media || [];
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      size: selectedSize,
      quantity,
      imageUrl: getFirstProductImage(media),
      color: selectedColor || undefined,
      discount_percentage: product.discount_percentage,
    });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const media = product.media || [];
  const sizes = product.sizes?.map((s) => s.size) || [
    "xs",
    "s",
    "m",
    "l",
    "xl",
  ];

  // SWIPER
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  
  // Update swiper when product changes
  useEffect(() => {
    if (swiper && media.length > 0) {
      setActiveImageIndex(0);
      swiper.slideTo(0);
    }
  }, [product.id, swiper, media.length]);

  // Avoid SSR hydration flicker
  useEffect(() => setIsMounted(true), []);
  if (!isMounted || !media?.length) return null;

  // Manual next/prev handling (to avoid loop flickers)
  const handleNext = () => {
    if (!swiper) return;
    if (activeImageIndex >= media.length - 1) {
      swiper.slideTo(0);
    } else {
      swiper.slideTo(activeImageIndex + 1);
    }
  };

  const handlePrev = () => {
    if (!swiper) return;
    if (activeImageIndex === 0) {
      swiper.slideTo(media.length - 1);
    } else {
      swiper.slideTo(activeImageIndex - 1);
    }
  };

  // COLORS

  return (
    <section className="max-w-[1920px] w-full mx-auto">
      <div className="flex flex-col lg:flex-row justify-around p-4 md:p-10 gap-10">
        <div 
          className={`relative w-full lg:w-1/2 flex justify-center transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}
          style={{ touchAction: 'pan-y pinch-zoom' }}
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-black dark:border-t-white rounded-full animate-spin"></div>
            </div>
          )}
          <Swiper
            modules={[Navigation]}
            onSwiper={setSwiper}
            slidesPerView={1}
            spaceBetween={10}
            speed={500}
            allowTouchMove={!isLoading}
            centeredSlides={true}
            onSlideChange={(s) => setActiveImageIndex(s.activeIndex)}
            className="product-swiper w-full max-w-[800px]"
            key={product.id}
            touchRatio={1}
            touchAngle={45}
            resistance={true}
            resistanceRatio={0.85}
            followFinger={true}
            threshold={5}
            longSwipes={true}
            longSwipesRatio={0.5}
            longSwipesMs={300}
            watchSlidesProgress={true}
            cssMode={false}
          >
            {media.map((item, i) => (
              <SwiperSlide key={i} style={{ touchAction: 'pan-y pinch-zoom' }}>
                <div 
                  className="flex justify-center items-center max-h-[85vh] overflow-hidden"
                  style={{ 
                    WebkitUserSelect: 'none',
                    userSelect: 'none',
                    WebkitTouchCallout: 'none'
                  }}
                >
                  {item.type === "video" ? (
                    <video
                      className="object-contain w-full max-h-[85vh]"
                      src={`/api/images/${item.url}`}
                      autoPlay
                      loop
                      muted
                      playsInline
                      style={{ 
                        WebkitUserSelect: 'none',
                        userSelect: 'none',
                        pointerEvents: 'auto'
                      }}
                    />
                  ) : (
                    <Image
                      src={`/api/images/${item.url}`}
                      alt={`Product media ${i}`}
                      width={800}
                      height={1160}
                      priority={i === activeImageIndex}
                      quality={i === activeImageIndex ? 90 : 80}
                      className="object-contain w-auto h-auto"
                      style={{ 
                        maxHeight: "85vh",
                        WebkitUserSelect: 'none',
                        userSelect: 'none',
                        pointerEvents: 'auto'
                      }}
                      draggable={false}
                    />
                  )}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {media.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                aria-label="Previous image"
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/70 dark:bg-black/50 rounded-full shadow-md hover:scale-110 transition"
              >
                <Image
                  src={
                    isDark
                      ? "/images/dark-theme/slider-button-left.svg"
                      : "/images/light-theme/slider-button-left.svg"
                  }
                  alt="Previous"
                  width={28}
                  height={28}
                />
              </button>

              <button
                onClick={handleNext}
                aria-label="Next image"
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/70 dark:bg-black/50 rounded-full shadow-md hover:scale-110 transition"
              >
                <Image
                  src={
                    isDark
                      ? "/images/dark-theme/slider-button-right.svg"
                      : "/images/light-theme/slider-button-right.svg"
                  }
                  alt="Next"
                  width={28}
                  height={28}
                />
              </button>
            </>
          )}
        </div>

        {/* Info Section */}
        <div className="flex flex-col gap-6 md:gap-10 px-4 md:px-0 w-full lg:w-1/2">
          {/* Availability */}
          <div className="text-base md:text-lg font-normal font-['Helvetica'] leading-relaxed tracking-wide">
            В наявності
          </div>

          {/* Product Name */}
          <div className={`text-3xl md:text-5xl lg:text-6xl font-normal font-['Inter'] capitalize leading-tight transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
            {product.name}
          </div>

          {/* Price */}
          <div className="w-full flex flex-col sm:flex-row justify-start border-b p-2 sm:p-4 gap-2">
            <div className="flex justify-start gap-8 text-2xl md:text-3xl font-['Helvetica']">
              {product.discount_percentage ? (
                <div className="flex items-center gap-2">
                  {/* Discounted price */}
                  <span className="font-medium text-red-600">
                    {(
                      product.price *
                      (1 - product.discount_percentage / 100)
                    ).toFixed(2)}
                    ₴
                  </span>

                  {/* Original (crossed-out) price */}
                  <span className="line-through">{product.price}₴</span>

                  {/* Optional: show discount percentage */}
                  <span className="text-green-600 text-sm">
                    -{product.discount_percentage}%
                  </span>
                </div>
              ) : (
                <span className="font-medium">{product.price}₴</span>
              )}
            </div>
          </div>

          {/* Size Picker Title */}
          <div className="flex items-center justify-between">
            <div className="text-base md:text-lg font-['Inter'] uppercase tracking-tight">
              Оберіть розмір
            </div>
            <button
              onClick={() => setShowSizeGuide(true)}
              className="text-sm md:text-base text-gray-600 dark:text-gray-400 underline hover:text-black dark:hover:text-white cursor-pointer transition-all duration-200"
            >
              Розмірна сітка
            </button>
          </div>

          {/* Size Options */}
          <div className="flex flex-wrap gap-2 md:gap-3">
            {sizes.map((size) => (
              <div
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`w-19 sm:w-19 md:w-22 p-2 sm:p-3 border-2 flex justify-center text-base md:text-lg font-['Inter'] uppercase cursor-pointer transition-all duration-200 ${
                  selectedSize === size
                    ? "border-black dark:border-white font-bold scale-105 shadow-md"
                    : "border-gray-300 dark:border-gray-600 hover:border-gray-600 dark:hover:border-gray-400 hover:scale-105 hover:shadow-md"
                }`}
              >
                {SIZE_MAP[size] || size}
              </div>
            ))}
          </div>

          {/* Color Picker */}
          {(product.colors && product.colors.length > 0) || relatedProducts.length > 0 ? (
            <div className="flex flex-col gap-3">
              <div className="text-sm md:text-base font-['Inter'] uppercase tracking-tight">
                Колір
              </div>
              
              <div className="flex flex-wrap items-center gap-3 md:gap-4">
                {/* Current product colors */}
                {product.colors && product.colors.length > 0 && 
                  product.colors.map((c, idx) => {
                    const isActive = selectedColor === c.label;
                    return (
                      <button
                        key={`current-${c.label}-${idx}`}
                        type="button"
                        onClick={() => setSelectedColor(c.label)}
                        className={`relative w-10 h-10 md:w-11 md:h-11 rounded-full border transition-all duration-200 ${
                          isActive
                            ? "border-black dark:border-white scale-100"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500"
                        }`}
                        aria-label={c.label}
                        title={c.label}
                        style={{ 
                          backgroundColor: c.hex || "#ffffff",
                        }}
                      >
                        {isActive && (
                          <div className="absolute inset-0 rounded-full border-2 border-black dark:border-white"></div>
                        )}
                      </button>
                    );
                  })
                }

                {/* Related products colors */}
                {relatedProducts.map((relatedProduct) => {
                  if (!relatedProduct.first_color) return null;
                  
                  const color = relatedProduct.first_color;
                  
                  return (
                    <button
                      key={`related-${relatedProduct.id}`}
                      type="button"
                      onClick={() => handleColorVariantChange(relatedProduct.id)}
                      disabled={isLoading}
                      className={`relative w-10 h-10 md:w-11 md:h-11 rounded-full border border-dashed border-gray-300 dark:border-gray-600 transition-all duration-200 hover:border-gray-500 dark:hover:border-gray-400 cursor-pointer ${
                        isLoading ? 'opacity-50 cursor-wait' : ''
                      }`}
                      aria-label={`Переглянути ${color.label}`}
                      title={color.label}
                      style={{ 
                        backgroundColor: color.hex || "#ffffff",
                        opacity: 0.7
                      }}
                    />
                  );
                })}
              </div>
              
              {selectedColor && (
                <div className="text-sm font-['Inter'] text-gray-700 dark:text-gray-300 font-light tracking-wide">
                  {selectedColor}
                </div>
              )}
            </div>
          ) : null}

          {/* Add to Cart Button */}
          <div
            onClick={handleAddToCart}
            className={`w-full text-center ${
              isDark
                ? "bg-white text-black hover:bg-gray-100"
                : "bg-black text-white hover:bg-gray-800"
            } p-3 text-lg md:text-xl font-medium font-['Inter'] uppercase tracking-tight cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]`}
          >
            в кошик
          </div>

          {/* Telegram Manager Link */}
          <a
            href="https://t.me/Nikita_Dom_A"
            target="_blank"
            rel="noopener noreferrer"
            className={`w-full text-center border ${
              isDark
                ? "border-gray-500 text-gray-400 hover:border-white hover:text-white"
                : "border-gray-400 text-gray-600 hover:border-black hover:text-black"
            } py-2 px-3 text-sm md:text-base font-light font-['Inter'] cursor-pointer transition-all duration-200`}
          >
            Написати менеджеру
          </a>

          {/* Size Guide Modal */}
          {showSizeGuide && (
            <div
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowSizeGuide(false)}
            >
              <div
                className="relative max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-auto max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setShowSizeGuide(false)}
                  className="absolute top-6 right-6 bg-black text-white rounded-full w-10 h-10 flex items-center justify-center text-2xl font-light hover:bg-gray-800 transition-colors z-10"
                >
                  ×
                </button>

                <div className="p-8 md:p-12">
                  <div className="text-center mb-10">
                    <h2 className="text-3xl md:text-4xl font-bold text-black tracking-tight font-['Inter']">
                      РОЗМІРНА СІТКА
                    </h2>
                    <div className="mt-2 text-sm text-gray-500 font-['Helvetica']">
                      Всі вимірювання вказані в сантиметрах
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-black border-collapse">
                      <thead>
                        <tr className="border-b-2 border-black">
                          <th className="py-4 px-3 text-center text-xs md:text-sm font-bold uppercase tracking-wider font-['Inter']">
                            Розмір
                          </th>
                          <th className="py-4 px-3 text-center text-xs md:text-sm font-bold uppercase tracking-wider font-['Inter']">
                            Обхват
                            <br />
                            грудей
                          </th>
                          <th className="py-4 px-3 text-center text-xs md:text-sm font-bold uppercase tracking-wider font-['Inter']">
                            Обхват
                            <br />
                            талії
                          </th>
                          <th className="py-4 px-3 text-center text-xs md:text-sm font-bold uppercase tracking-wider font-['Inter']">
                            Обхват
                            <br />
                            бедер
                          </th>
                          <th className="py-4 px-3 text-center text-xs md:text-sm font-bold uppercase tracking-wider font-['Inter']">
                            Зріст
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                          <td className="py-5 px-3 text-center font-bold text-lg font-['Inter']">
                            S
                          </td>
                          <td className="py-5 px-3 text-center font-['Helvetica']">
                            <div className="text-base">88-92</div>
                          </td>
                          <td className="py-5 px-3 text-center font-['Helvetica']">
                            <div className="text-base">77-80</div>
                          </td>
                          <td className="py-5 px-3 text-center font-['Helvetica']">
                            <div className="text-base">93-96</div>
                          </td>
                          <td className="py-5 px-3 text-center font-['Helvetica']">
                            <div className="text-base">175-180</div>
                          </td>
                        </tr>
                        <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                          <td className="py-5 px-3 text-center font-bold text-lg font-['Inter']">
                            M
                          </td>
                          <td className="py-5 px-3 text-center font-['Helvetica']">
                            <div className="text-base">96-100</div>
                          </td>
                          <td className="py-5 px-3 text-center font-['Helvetica']">
                            <div className="text-base">84-88</div>
                          </td>
                          <td className="py-5 px-3 text-center font-['Helvetica']">
                            <div className="text-base">98-101</div>
                          </td>
                          <td className="py-5 px-3 text-center font-['Helvetica']">
                            <div className="text-base">180-185</div>
                          </td>
                        </tr>
                        <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                          <td className="py-5 px-3 text-center font-bold text-lg font-['Inter']">
                            L
                          </td>
                          <td className="py-5 px-3 text-center font-['Helvetica']">
                            <div className="text-base">104-108</div>
                          </td>
                          <td className="py-5 px-3 text-center font-['Helvetica']">
                            <div className="text-base">92-97</div>
                          </td>
                          <td className="py-5 px-3 text-center font-['Helvetica']">
                            <div className="text-base">103-106</div>
                          </td>
                          <td className="py-5 px-3 text-center font-['Helvetica']">
                            <div className="text-base">180-190</div>
                          </td>
                        </tr>
                        <tr className="hover:bg-gray-50 transition-colors">
                          <td className="py-5 px-3 text-center font-bold text-lg font-['Inter']">
                            XL
                          </td>
                          <td className="py-5 px-3 text-center font-['Helvetica']">
                            <div className="text-base">112-116</div>
                          </td>
                          <td className="py-5 px-3 text-center font-['Helvetica']">
                            <div className="text-base">100-104</div>
                          </td>
                          <td className="py-5 px-3 text-center font-['Helvetica']">
                            <div className="text-base">108-111</div>
                          </td>
                          <td className="py-5 px-3 text-center font-['Helvetica']">
                            <div className="text-base">190+</div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="text-center mt-10 pt-6 border-t border-gray-200">
                    <Image
                      src="/images/light-theme/chars-logo-header-light.png"
                      alt="CHARS Logo"
                      width={120}
                      height={40}
                      className="mx-auto h-10 opacity-80"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Toast */}
          {showToast && (
            <div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 bg-black text-white px-5 py-3 rounded shadow-lg z-50">
              Товар додано до кошика!
            </div>
          )}

          {/* Alert */}
          <Alert
            type={alertType}
            message={alertMessage || ""}
            isVisible={!!alertMessage}
            onClose={() => setAlertMessage(null)}
          />

          {/* Description Section */}
          <div className="w-full md:w-[522px]">
            <div className="mb-3 md:mb-4 text-xl md:text-2xl font-['Inter'] uppercase tracking-tight">
              опис
            </div>
            <div className="text-sm md:text-lg font-['Inter'] leading-relaxed tracking-wide">
              {product.description}
            </div>
          </div>

          {product.fabric_composition && (
            <div className="opacity-90">
              <h3>Cклад тканини: </h3>
              <span>{product.fabric_composition}</span>
            </div>
          )}

          {product.has_lining && (
            <div className="opacity-90">
              <h3>Підкладка: </h3>
              <span>{product.lining_description}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
