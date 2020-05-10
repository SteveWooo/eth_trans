pragma solidity ^0.4.17;
contract Calc{
    uint count;
    function add(uint a, uint b) returns(uint){
        count++;
        return a + b + 1;
    }
    function getCount() constant returns (uint){
        return count;
    }
}