import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { RatingStars } from "@/components/movie/RatingStars";
import { ModelSelector } from "@/components/ml/ModelSelector";
import { MovieCard } from "@/components/movie/MovieCard";

describe("RatingStars component", () => {
  it("renders 5 stars and handles rating interaction", () => {
    const onRate = vi.fn();
    render(<RatingStars initialRating={3} onRate={onRate} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(5);

    fireEvent.click(buttons[4]); // Click 5th star
    expect(onRate).toHaveBeenCalledWith(5);
  });
});

describe("ModelSelector component", () => {
  it("renders all model choices and handles selection", () => {
    const onSelect = vi.fn();
    render(<ModelSelector selectedModel="Hybrid" onSelectModel={onSelect} />);
    expect(screen.getAllByText("Hybrid Ensemble").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Item-Based CF")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Item-Based CF"));
    expect(onSelect).toHaveBeenCalledWith("ItemKNN");
  });
});

describe("MovieCard component", () => {
  it("renders title, year, genres, and match score", () => {
    const sampleMovie = {
      id: 1,
      title: "Interstellar",
      genres: ["Sci-Fi", "Drama"],
      year: 2014,
      poster_url: null,
    };
    render(<MovieCard movie={sampleMovie} score={4.85} rank={1} />);
    expect(screen.getByText("Interstellar")).toBeInTheDocument();
    expect(screen.getByText("2014")).toBeInTheDocument();
    expect(screen.getByText("97% Match")).toBeInTheDocument();
    expect(screen.getByText("#1")).toBeInTheDocument();

  });
});
