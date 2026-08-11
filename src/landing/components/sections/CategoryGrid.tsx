import { CategoryIcon } from "@/landing/components/ui/CategoryIcon";
import { categories } from "@/landing/data/content";

export function CategoryGrid() {
  return (
    <section id="category" className="max-w-[1200px] mx-auto px-4 sm:px-8 py-10">
      <div className="max-w-[600px] mx-auto text-center mb-14">
        <p className="bg-gradient-to-r from-amber-500/20 to-amber-500/40 text-white w-fit mx-auto px-6 py-1.5 rounded-full font-plus">
            Browse by category
          </p>
        <h2 className="text-3xl sm:text-4xl font-plus font-bold leading-tight mt-4">
          One seat away from any of them.
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border border border-border">
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-panel px-6 py-8 hover:bg-panel-2 transition-colors duration-300"
          >
            <CategoryIcon
              category={category.name}
              className="w-8 h-8 text-brass-light mb-5"
            />
            <h4 className="text-base font-plus font-semibold mb-1.5">
              {category.name}
            </h4>
            <p className="text-sm font-plus text-text-muted mb-4">
              {category.description}
            </p>
            <div className="font-plus text-xs text-brass-light">
              {category.liveCount} raffles live
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
