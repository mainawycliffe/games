import styles from "./CardGrid.module.css";

export function CardGrid({ clickCorrectOdd, normalColor, oddColor, oddIndex }) {
  const gridStyle = {
    "--normal-color": normalColor,
    "--odd-color": oddColor,
  };
  const gridItems = Array.from({ length: 9 });

  return (
    <div className={styles.main} style={gridStyle}>
      {gridItems.map((_, index) => {
        const isOdd = index === oddIndex;

        return (
          <div
            key={index}
            className={isOdd ? styles.odd : styles.grids}
            onClick={() => clickCorrectOdd(isOdd)}
          ></div>
        );
      })}
    </div>
  );
}
