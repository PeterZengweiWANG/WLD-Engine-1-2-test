export type GalleryImage = {
  src: string;
  title: string;
};

//Gallery of images with a callback function for when the user clicks an image
export default function ImageGallery({
  images,
  handleClickImage,
}: {
  images: GalleryImage[];
  handleClickImage?: (id: number) => void;
}) {
  return (
    <div className="grid grid-cols-3 w-full gap-4">
      {images.map((galleryImage, i) => (
        <button
          key={i}
          className="rounded-lg overflow-hidden flex flex-col"
          onClick={() => handleClickImage && handleClickImage(i)}
        >
          <img src={galleryImage.src} />
          <span className=" bg-white w-full p-2">{galleryImage.title}</span>
        </button>
      ))}
    </div>
  );
}
