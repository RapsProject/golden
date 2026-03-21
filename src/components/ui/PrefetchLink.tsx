import { useCallback, type ComponentProps } from 'react';
import { NavLink } from 'react-router-dom';
import { routeChunkMap } from '../../routeChunks';

type PrefetchLinkProps = ComponentProps<typeof NavLink>;

/**
 * Drop-in replacement for `<NavLink>` that preloads the route chunk
 * when the user **hovers** or **focuses** the link.
 *
 * This makes navigation feel near-instant because the JS chunk
 * is already downloaded before the user clicks.
 */
export function PrefetchLink(props: PrefetchLinkProps) {
  const to = typeof props.to === 'string' ? props.to : props.to.pathname ?? '';

  const handlePrefetch = useCallback(() => {
    const loader = routeChunkMap[to];
    if (loader) {
      loader();
    }
  }, [to]);

  return (
    <NavLink
      {...props}
      onMouseEnter={(e) => {
        handlePrefetch();
        if (typeof props.onMouseEnter === 'function') props.onMouseEnter(e);
      }}
      onFocus={(e) => {
        handlePrefetch();
        if (typeof props.onFocus === 'function') props.onFocus(e);
      }}
    />
  );
}
