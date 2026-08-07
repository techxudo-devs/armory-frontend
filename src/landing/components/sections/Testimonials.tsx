import { Star } from "lucide-react";
import { Eyebrow } from "@/landing/components/ui/Eyebrow";
import { testimonials } from "@/landing/data/content";

export function Testimonials() {
  return (
    <section className="max-w-[1200px] mx-auto px-8 py-24">
      <div className="max-w-[560px] mb-14">
        <Eyebrow withLine>What people say</Eyebrow>
        <h2 className="text-[34px] font-bold leading-tight mt-4">Trusted by 12,000+ regulars</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className="bg-panel border border-border p-7 flex flex-col gap-5">
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} className="w-3.5 h-3.5 fill-brass-light text-brass-light" />
              ))}
            </div>
            <p className="text-[14.5px] text-text-secondary leading-relaxed">&quot;{testimonial.quote}&quot;</p>
            <div className="flex items-center gap-3 mt-auto">
              <div className="w-9 h-9 bg-brass-dim flex items-center justify-center font-plus font-bold text-[13px] text-brass-light">
                {testimonial.initials}
              </div>
              <div>
                <div className="text-[13px] font-semibold">{testimonial.name}</div>
                <div className="text-[11.5px] text-text-muted">{testimonial.location}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
