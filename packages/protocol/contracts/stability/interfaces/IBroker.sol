// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.5.13;

/*
 * @title Broker Interface for trader functions
 * @notice The broker is responsible for executing swaps and keeping track of trading limits
 */
interface IBroker {
  /**
   * @notice Emitted when a swap occurs
   * @param pairId The id of the pair where the swap occured
   * @param trader The user that initiated the swap
   * @param tokenIn The address of the token that was sold
   * @param tokenOut The address of the token that was bought
   * @param amountIn The amount of token sold 
   * @param amountOut The amount of token bought
   */
  event Swap(
    address listingManager,
    bytes32 indexed pairId,
    address indexed trader,
    address indexed tokenIn,
    address tokenOut,
    uint256 amountIn,
    uint256 amountOut
  );

  /**
   * @notice Execute a token swap with fixed amountIn
   * @param listingManager the address of the listing manager for the pair
   * @param pairId The id of the pair to be swapped
   * @param tokenIn The token to be sold
   * @param tokenOut The token to be bought 
   * @param amountIn The amount of tokenIn to be sold
   * @param amountOutMin Minimum amountOut to be received - controls slippage
   * @return amountOut The amount of tokenOut to be bought
   */
  function swapIn(
    address listingManager,
    bytes32 pairId,
    address tokenIn,
    address tokenOut,
    uint256 amountIn,
    uint256 amountOutMin
  ) external returns (uint256 amountOut);

  /**
   * @notice Execute a token swap with fixed amountOut
   * @param listingManager the address of the listing manager for the pair
   * @param pairId The id of the pair to be swapped
   * @param tokenIn The token to be sold
   * @param tokenOut The token to be bought 
   * @param amountOut The amount of tokenOut to be bought
   * @param amountInMax Maximum amount of tokenIn that can be traded
   * @return amountIn The amount of tokenIn to be sold
   */
  function swapOut(
    address listingManager,
    bytes32 pairId,
    address tokenIn,
    address tokenOut,
    uint256 amountOut,
    uint256 amountInMax
  ) external returns (uint256 amountIn);

  /**
   * @notice Quote a token swap with fixed amountIn
   * @param listingManager the address of the listing manager for the pair
   * @param pairId The id of the pair to be swapped
   * @param tokenIn The token to be sold
   * @param tokenOut The token to be bought 
   * @param amountIn The amount of tokenIn to be sold
   * @return amountOut The amount of tokenOut to be bought
   */
  function quoteIn(
    address listingManager,
    bytes32 pairId,
    address tokenIn,
    address tokenOut,
    uint256 amountIn
  ) external returns (uint256 amountOut);

  /**
   * @notice Quote a token swap with fixed amountOut
   * @param listingManager the address of the listing manager for the pair
   * @param pairId The id of the pair to be swapped
   * @param tokenIn The token to be sold
   * @param tokenOut The token to be bought 
   * @param amountOut The amount of tokenOut to be bought
   * @return amountIn The amount of tokenIn to be sold
   */
  function quoteOut(
    address listingManager,
    bytes32 pairId,
    address tokenIn,
    address tokenOut,
    uint256 amountOut
  ) external returns (uint256 amountIn);

  /**
   * @notice Get the list of registered listing managers.
   * @dev This can be used by UI or clients to discover all pairs.
   * @return listingManagers the addresses of all listing managers.
   */
  function getListingManagers() external returns (address[] memory listingManagers);
}
