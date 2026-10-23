type LandingImageProps = {
  name: 'img1' | 'img2' | 'img3' | 'img4'
  alt?: string
}

export default function LandingImage({ name, alt = '' }: LandingImageProps) {
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
      <img src={`/assets/landing/${name}_sm.png`} alt={alt} />
    </picture>
  )
}
