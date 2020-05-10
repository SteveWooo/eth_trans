pragma solidity ^0.4.20;

contract ERC20{
    string public name;
    string public symbol;
    uint8 public decimals;
    uint public totalSupply;

    mapping(address => uint256) internal balances;
    mapping (address => mapping(address => uint256)) internal allowed;

    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);

    constructor() public{
        name = "MeiToken";
        symbol = "MTK";
        decimals = 2;
        totalSupply = 1000000000*10**uint(decimals);
        balances[msg.sender] = totalSupply;
    }

    function balanceOf(address tokenOwner) public constant returns (uint balance) {
        return balances[tokenOwner];
    }

    function transfer(address _to, uint256 _value) public returns (bool success){
        success = false;
        require(_to != address(0));
        require(msg.sender != _to);
        require(balances[msg.sender] >= _value);
        require(balances[_to] + _value > balances[_to]);

        balances[msg.sender] -= _value;
        balances[_to] += _value;

        emit Transfer(msg.sender, _to, _value);
        success = true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success){

        require(_to != address(0));
        require(balances[_from] >= _value);
        require(allowed[_from][msg.sender] >= _value);
        require(balances[_to] + _value > balances[_to]);

        balances[_from] -= _value;
        balances[_to] += _value;
        emit Transfer(_from, _to, _value);
        success = true;
    }

    function approve(address _spender, uint256 _value) public returns (bool success){

        allowed[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        success = true;
    }

    function allowance(address _owner, address _spender) view public returns (uint256 remaining){
        return allowed[_owner][_spender];
    }
}