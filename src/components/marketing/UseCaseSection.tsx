"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check } from "lucide-react";
import Icon from "@/components/Icon";
import { useReveal } from "@/lib/hooks";
import type { UseCase } from "@/data/site";
import styles from "./use-case-section.module.css";

/**
 * One industry section.
 * Brief: "Use case sections: alternate left-right fade in on scroll."
 */
export default function UseCaseSection({
  useCase,
  index,
  image,
}: {
  useCase: UseCase;
  index: number;
  image: string;
}) {
  const { ref, visible } = useReveal<HTMLElement>(0.12);
  const flipped = index % 2 === 1;

  return (
    <section
      id={useCase.slug}
      ref={ref}
      className={styles.section}
      data-flipped={flipped}
      aria-labelledby={`uc-${useCase.slug}`}
    >
      <div className="dp-container">
        <div className={styles.grid}>
          <div
            className={`${styles.copy} ${flipped ? "dp-reveal-right" : "dp-reveal-left"}`}
            data-visible={visible}
          >
            <span className={styles.badge}>
              <Icon name={useCase.icon} size={16} />
              {useCase.industry}
            </span>

            <h2 id={`uc-${useCase.slug}`} className={styles.title}>
              {useCase.industry}
            </h2>

            <div className={styles.block}>
              <h3 className={styles.blockLabel}>The challenge</h3>
              <p className={styles.blockCopy}>{useCase.challenge}</p>
            </div>

            <div className={styles.block}>
              <h3 className={styles.blockLabel}>How DataPulse solves it</h3>
              <p className={styles.blockCopy}>{useCase.solution}</p>
            </div>

            <div className={styles.block}>
              <h3 className={styles.blockLabel}>Key metrics tracked</h3>
              <ul className={styles.metrics}>
                {useCase.metrics.map((m) => (
                  <li key={m}>
                    <Check size={14} aria-hidden="true" />
                    {m}
                  </li>
                ))}
              </ul>
            </div>

            <Link href="/demo" className={styles.cta}>
              See a Demo
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>

          <figure
            className={`${styles.media} ${flipped ? "dp-reveal-left" : "dp-reveal-right"}`}
            data-visible={visible}
          >
            <div className={styles.frame}>
              <Image
                src={image}
                alt={useCase.imageAlt}
                width={800}
                height={500}
                className={styles.image}
                sizes="(max-width: 992px) 100vw, 48vw"
              />
            </div>
            <figcaption className={styles.caption}>
              Dashboard view tailored for {useCase.industry.toLowerCase()}
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
