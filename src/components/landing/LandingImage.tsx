type LandingImageProps = {
  name: 'img2' | 'img3' | 'img4'
  className?: string
  alt?: string
}

export default function LandingImage({
  name,
  className,
  alt = '',
}: LandingImageProps) {
  return (
    <picture>
      <source
        media="(min-width: 1200px)"
        srcSet={`/assets/landing/${name}_lg.png`}
      />
      <source
        media="(min-width: 768px)"
        srcSet={`/assets/landing/${name}_md.png`}
      />
      <img
        src={`/assets/landing/${name}_sm.png`}
        className={className}
        alt={alt}
      />
    </picture>
  )
}
